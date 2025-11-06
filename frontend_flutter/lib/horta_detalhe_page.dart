// lib/horta_detalhe_page.dart
import 'package:flutter/material.dart';
import 'models.dart'; // Importa todos os modelos e funções de API
import 'hortalica_detalhe_calculo_page.dart'; // Tela de destino

class HortaDetalhePage extends StatefulWidget {
  final Horta horta;
  const HortaDetalhePage({super.key, required this.horta});

  @override
  State<HortaDetalhePage> createState() => _HortaDetalhePageState();
}

class _HortaDetalhePageState extends State<HortaDetalhePage> {
  // Future para carregar os dados combinados
  late Future<List<CultivoDetalhado>> _cultivosDetalhadosFuture;

  // Estado de loading para o botão de calendário
  bool _isLoadingCalendario = false;

  @override
  void initState() {
    super.initState();
    // Dispara a busca de dados complexa
    _cultivosDetalhadosFuture = _fetchCultivosDetalhados(widget.horta.id);
  }

  // Esta função é uma "ViewModel"
  // Ela busca Cultivos e Hortalicas separadamente e os combina em uma
  // única lista de 'CultivoDetalhado' para a UI.
  Future<List<CultivoDetalhado>> _fetchCultivosDetalhados(int hortaId) async {
    // 1. Inicia as duas chamadas de API ao mesmo tempo
    final futureCultivos = fetchCultivos(hortaId);
    final futureHortalicas = fetchHortalicas(); // Pega todos os modelos

    // 2. Espera as duas terminarem
    final results = await Future.wait([futureCultivos, futureHortalicas]);

    final List<Cultivo> cultivos = results[0] as List<Cultivo>;
    final List<Hortalica> hortalicas = results[1] as List<Hortalica>;

    // 3. Cria um Mapa (Dicionário) para consulta rápida (ID -> Hortalica)
    // Isso evita um loop dentro de um loop (performance O(n*m) -> O(n+m))
    final Map<int, Hortalica> hortalicaMap = {
      for (var h in hortalicas) h.id: h,
    };

    // 4. Combina os dados
    List<CultivoDetalhado> detalhados = [];
    for (var cultivo in cultivos) {
      final hortalica = hortalicaMap[cultivo.hortalicaId];
      if (hortalica != null) {
        detalhados.add(
          CultivoDetalhado(cultivo: cultivo, hortalica: hortalica),
        );
      }
    }
    return detalhados;
  }

  // Mostra o resultado da API de Calendário em um Popup
  void _mostrarCalendarioPopup(List<AtividadeCalendario> calendario) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Calendário de Atividades"),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: calendario.length,
              itemBuilder: (context, index) {
                final atividade = calendario[index];
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      "Módulo ${atividade.modulo}:\n"
                      "Plantio: ${atividade.dataPlantio}\n"
                      "Colheita: ${atividade.dataInicioColheita}",
                      // TODO: Formatar as datas (ex: com 'intl')
                    ),
                  ),
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text("Fechar"),
            ),
          ],
        );
      },
    );
  }

  // Função chamada quando o botão de calendário é pressionado
  void _onGerarCalendarioPressed(int cultivoId) async {
    setState(() {
      _isLoadingCalendario = true;
    });
    try {
      final calendario = await fetchCalendario(cultivoId);
      // Sucesso
      setState(() {
        _isLoadingCalendario = false;
      });
      _mostrarCalendarioPopup(calendario);
    } catch (e) {
      // Erro
      setState(() {
        _isLoadingCalendario = false;
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Erro ao gerar calendário: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.horta.nome)),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Cultivos em ${widget.horta.nome}:",
              style: Theme.of(context).textTheme.titleLarge,
            ),

            // Constrói a lista de cultivos
            Expanded(
              child: FutureBuilder<List<CultivoDetalhado>>(
                future: _cultivosDetalhadosFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(child: Text('Erro: ${snapshot.error}'));
                  } else if (snapshot.hasData && snapshot.data!.isNotEmpty) {
                    final List<CultivoDetalhado> cultivosDetalhados =
                        snapshot.data!;

                    return ListView.builder(
                      itemCount: cultivosDetalhados.length,
                      itemBuilder: (context, index) {
                        final item = cultivosDetalhados[index];

                        return Card(
                          child: ListTile(
                            title: Text(
                              item.hortalica.nome, // Mostra o nome, não o ID
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            subtitle: Text(
                              "Módulos: ${item.cultivo.numModulos} | Início: ${item.cultivo.dataInicio}",
                            ),
                            trailing: ElevatedButton(
                              onPressed: _isLoadingCalendario
                                  ? null // Desabilita o botão se já estiver carregando
                                  : () => _onGerarCalendarioPressed(
                                      item.cultivo.id,
                                    ),
                              child: _isLoadingCalendario
                                  ? const SizedBox(
                                      height: 15,
                                      width: 15,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Icon(Icons.calendar_month),
                            ),
                            onTap: () {
                              // Navega para a nova tela de detalhes e cálculo
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      HortalicaDetalheCalculoPage(
                                        cultivoDetalhado:
                                            item, // Passa o item combinado
                                      ),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    );
                  } else {
                    return const Center(
                      child: Text('Nenhum cultivo cadastrado para esta horta.'),
                    );
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
