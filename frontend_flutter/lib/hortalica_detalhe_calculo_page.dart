// lib/hortalica_detalhe_calculo_page.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'models.dart'; // Importa todos os modelos e funções de API

class ResultadoDimensionamento {
  final int numModulos;
  final double areaTotal;

  ResultadoDimensionamento({required this.numModulos, required this.areaTotal});

  factory ResultadoDimensionamento.fromJson(Map<String, dynamic> json) {
    return ResultadoDimensionamento(
      numModulos: json['num_modulos_calculado'] as int,
      areaTotal: (json['area_total_calculada'] as num).toDouble(),
    );
  }
}

class HortalicaDetalheCalculoPage extends StatefulWidget {
  final CultivoDetalhado cultivoDetalhado;

  const HortalicaDetalheCalculoPage({
    super.key,
    required this.cultivoDetalhado,
  });

  @override
  State<HortalicaDetalheCalculoPage> createState() =>
      _HortalicaDetalheCalculoPageState();
}

class _HortalicaDetalheCalculoPageState
    extends State<HortalicaDetalheCalculoPage> {
  // Apenas o controlador de produção é necessário para a API
  final _producaoSemanalController = TextEditingController();

  ResultadoDimensionamento? _resultadoDimensionamento;
  bool _isLoading = false;

  // --- FUNÇÃO DA API ---
  Future<void> _calcularDimensionamento() async {
    final producaoSemanal = double.tryParse(_producaoSemanalController.text);

    if (producaoSemanal == null || producaoSemanal <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Por favor, insira um valor válido para a Produção Semanal.',
          ),
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    // URL da API (GET com query param)
    final hortalicaId = widget.cultivoDetalhado.hortalica.id;
    final url = Uri.parse(
      'http://127.0.0.1:8000/api/hortalicas/$hortalicaId/calcular-dimensionamento/?desejada=$producaoSemanal',
    );

    try {
      // Método HTTP para GET
      final response = await http.get(url).timeout(const Duration(seconds: 10));

      setState(() {
        _isLoading = false;
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        setState(() {
          _resultadoDimensionamento = ResultadoDimensionamento.fromJson(data);
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Erro ao calcular: ${jsonDecode(utf8.decode(response.bodyBytes))} (Status: ${response.statusCode})',
            ),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Erro de rede: $e')));
    }
  }

  @override
  void dispose() {
    _producaoSemanalController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hortalica = widget.cultivoDetalhado.hortalica;

    return Scaffold(
      appBar: AppBar(title: Text('Detalhes de ${hortalica.nome}')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Informações da Hortaliça (Detalhes da Planilha)
            Text(
              hortalica.nome,
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(color: Colors.green),
            ),
            const SizedBox(height: 8),
            Text('Tipo de Plantio: ${hortalica.tipoPlantio}'),
            Text('Ciclo Total: ${hortalica.cicloTotal} semanas'),
            Text(
              'Produtividade Esperada: ${hortalica.produtividadeEsperada} / módulo',
            ),
            Text('Área por Módulo: ${hortalica.areaModulo} m²'),
            const SizedBox(height: 20),

            const Divider(),
            const SizedBox(height: 20),

            // Seção de Dimensionamento
            Text(
              'Calcular Dimensionamento:',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),

            // Campo de Produção (o único usado pela API)
            TextFormField(
              controller: _producaoSemanalController,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: const InputDecoration(
                labelText: 'Produção Semanal Desejada',
                hintText: 'Ex: 100.0',
                border: OutlineInputBorder(),
                suffixText: 'kg ou un',
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _calcularDimensionamento,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                padding: const EdgeInsets.symmetric(vertical: 16),
                textStyle: const TextStyle(fontSize: 18),
                minimumSize: const Size(double.infinity, 0),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text(
                      'Calcular',
                      style: TextStyle(color: Colors.white),
                    ),
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
                      // Campos de resultado
                      Text(
                        'Número de Módulos: ${_resultadoDimensionamento!.numModulos}',
                      ),
                      Text(
                        'Área Necessária: ${_resultadoDimensionamento!.areaTotal.toStringAsFixed(2)} m²',
                      ),
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
