// lib/hortalica_detalhe_calculo_page.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'models.dart'; // Importa todos os modelos e funções de API

// Modelo para o resultado do Dimensionamento
class ResultadoDimensionamento {
  final double numModulos;
  final double areaNecessariaM2;
  final int numPlantasPorCiclo;

  ResultadoDimensionamento({
    required this.numModulos,
    required this.areaNecessariaM2,
    required this.numPlantasPorCiclo,
  });

  factory ResultadoDimensionamento.fromJson(Map<String, dynamic> json) {
    return ResultadoDimensionamento(
      numModulos: (json['num_modulos'] as num).toDouble(),
      areaNecessariaM2: (json['area_necessaria_m2'] as num).toDouble(),
      numPlantasPorCiclo: json['num_plantas_por_ciclo'],
    );
  }
}

class HortalicaDetalheCalculoPage extends StatefulWidget {
  final CultivoDetalhado cultivoDetalhado; // Recebe o Cultivo e a Hortaliça já combinados

  const HortalicaDetalheCalculoPage({super.key, required this.cultivoDetalhado});

  @override
  State<HortalicaDetalheCalculoPage> createState() => _HortalicaDetalheCalculoPageState();
}

class _HortalicaDetalheCalculoPageState extends State<HortalicaDetalheCalculoPage> {
  // Controladores para os inputs do usuário
  final _areaDesejadaController = TextEditingController();
  final _producaoSemanalController = TextEditingController();

  // Resultado do cálculo
  ResultadoDimensionamento? _resultadoDimensionamento;
  bool _isLoading = false;

  // Função para chamar a API de Dimensionamento
  Future<void> _calcularDimensionamento() async {
    final areaDesejada = double.tryParse(_areaDesejadaController.text);
    final producaoSemanal = double.tryParse(_producaoSemanalController.text);

    // Validação básica
    if (areaDesejada == null && producaoSemanal == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, insira a Área Desejada ou a Produção Semanal.')),
      );
      return;
    }

    setState(() { _isLoading = true; });

    final url = Uri.parse('http://127.0.0.1:8000/api/calcular-dimensionamento/');
    
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'hortalica_id': widget.cultivoDetalhado.hortalica.id,
          'area_desejada_total_m2': areaDesejada, // Pode ser null
          'producao_semanal_desejada_kg': producaoSemanal, // Pode ser null
        }),
      );

      setState(() { _isLoading = false; });

      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        setState(() {
          _resultadoDimensionamento = ResultadoDimensionamento.fromJson(data);
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao calcular: ${jsonDecode(utf8.decode(response.bodyBytes))} (Status: ${response.statusCode})')),
        );
      }
    } catch (e) {
      setState(() { _isLoading = false; });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro de rede: $e')),
      );
    }
  }

  @override
  void dispose() {
    _areaDesejadaController.dispose();
    _producaoSemanalController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hortalica = widget.cultivoDetalhado.hortalica;

    return Scaffold(
      appBar: AppBar(
        title: Text('Detalhes de ${hortalica.nome}'),
      ),
      body: SingleChildScrollView( // Para evitar overflow se o teclado aparecer
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Informações da Hortaliça (Detalhes da Planilha)
            Text(
              hortalica.nome,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: Colors.green),
            ),
            const SizedBox(height: 8),
            Text('Tipo de Plantio: ${hortalica.tipoPlantio}'),
            Text('Ciclo Total: ${hortalica.cicloTotal} semanas'),
            Text('Produtividade Esperada: ${hortalica.produtividadeEsperada} / módulo'),
            Text('Área por Módulo: ${hortalica.areaModulo} m²'),
            const SizedBox(height: 20),
            
            const Divider(),
            const SizedBox(height: 20),

            // Seção de Dimensionamento
            Text(
              'Dimensionamento (Opcional):',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _areaDesejadaController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Área Desejada Total (m²)',
                hintText: 'Ex: 100.0',
                border: OutlineInputBorder(),
                suffixText: 'm²',
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _producaoSemanalController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Produção Semanal Desejada (kg)',
                hintText: 'Ex: 5.0',
                border: OutlineInputBorder(),
                suffixText: 'kg',
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _calcularDimensionamento,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                padding: const EdgeInsets.symmetric(vertical: 16),
                textStyle: const TextStyle(fontSize: 18),
                minimumSize: const Size(double.infinity, 0), // Ocupa a largura total
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Calcular Dimensionamento', style: TextStyle(color: Colors.white)),
            ),
            const SizedBox(height: 24),

            // Resultado do Dimensionamento
            if (_resultadoDimensionamento != null)
              Card(
                color: Colors.green.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Resultado do Cálculo:',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Text('Número de Módulos: ${_resultadoDimensionamento!.numModulos.toStringAsFixed(2)}'),
                      Text('Área Necessária: ${_resultadoDimensionamento!.areaNecessariaM2.toStringAsFixed(2)} m²'),
                      Text('Plantas por Ciclo: ${_resultadoDimensionamento!.numPlantasPorCiclo}'),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}