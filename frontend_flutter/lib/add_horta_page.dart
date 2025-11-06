// lib/add_horta_page.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AddHortaPage extends StatefulWidget {
  const AddHortaPage({super.key});

  @override
  State<AddHortaPage> createState() => _AddHortaPageState();
}

class _AddHortaPageState extends State<AddHortaPage> {
  // Controladores para ler o texto dos campos
  final _nomeController = TextEditingController();
  final _localizacaoController = TextEditingController();
  final _areaTotalController = TextEditingController();

  // Estado de carregamento
  bool _isLoading = false;

  // Função para fazer o POST (Criar)
  Future<void> _salvarHorta() async {
    // Validação simples
    if (_nomeController.text.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('O nome é obrigatório.')));
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final url = Uri.parse('http://127.0.0.1:8000/api/hortas/');

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          // TODO: Adicionar autenticação (ex: Bearer token) se o backend exigir
        },
        body: jsonEncode({
          'nome': _nomeController.text,
          'localizacao': _localizacaoController.text,
          'area_total': _areaTotalController.text.isNotEmpty
              ? double.tryParse(_areaTotalController.text)
              : null,
          // NOTA: O 'responsavel' é definido automaticamente no backend
        }),
      );

      setState(() {
        _isLoading = false;
      });

      if (response.statusCode == 201) {
        // 201 = Created
        // Sucesso!
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Horta criada com sucesso!')),
        );
        // Volta para a tela anterior (HortaListPage) e retorna 'true'
        // para que a HortaListPage possa atualizar a lista
        Navigator.pop(context, true);
      } else {
        // Erro do servidor
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao salvar: ${response.body}')),
        );
      }
    } catch (e) {
      // Erro de rede
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
    // Limpa os controladores quando a tela é fechada para liberar memória
    _nomeController.dispose();
    _localizacaoController.dispose();
    _areaTotalController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Adicionar Nova Horta')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          // Usamos ListView para evitar overflow do teclado
          children: [
            // Campo Nome
            TextFormField(
              controller: _nomeController,
              decoration: const InputDecoration(
                labelText: 'Nome da Horta *',
                hintText: 'Ex: Horta da Escola',
                border: OutlineInputBorder(),
              ),
              textCapitalization: TextCapitalization.words,
            ),
            const SizedBox(height: 16),

            // Campo Localização
            TextFormField(
              controller: _localizacaoController,
              decoration: const InputDecoration(
                labelText: 'Localização',
                hintText: 'Ex: Bairro Centro',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            // Campo Área Total
            TextFormField(
              controller: _areaTotalController,
              decoration: const InputDecoration(
                labelText: 'Área Total (m²)',
                hintText: 'Ex: 50.5',
                border: OutlineInputBorder(),
                suffixText: 'm²',
              ),
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
            ),

            const SizedBox(height: 32),

            // Botão Salvar
            ElevatedButton(
              onPressed: _isLoading ? null : _salvarHorta,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                padding: const EdgeInsets.symmetric(vertical: 16),
                textStyle: const TextStyle(fontSize: 18),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text(
                      'Salvar Horta',
                      style: TextStyle(color: Colors.white),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
