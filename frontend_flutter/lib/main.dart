// lib/main.dart
import 'package:flutter/material.dart';

// Telas
import 'splash_screen.dart';
import 'add_horta_page.dart';
import 'horta_detalhe_page.dart';

// Modelos e Funções de API
import 'models.dart';

// --- APP PRINCIPAL ---
void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Horta Fácil',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.green,
        scaffoldBackgroundColor: const Color(0xFFF5F5F5),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF34495E), // Um azul-escuro
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        cardTheme: const CardThemeData(
          elevation: 2,
          margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(12)),
          ),
        ),
      ),
      // A tela inicial é a SplashScreen
      home: const SplashScreen(),
    );
  }
}

// --- TELA DE LISTA DE HORTAS ---
class HortaListPage extends StatefulWidget {
  const HortaListPage({super.key});

  @override
  State<HortaListPage> createState() => _HortaListPageState();
}

class _HortaListPageState extends State<HortaListPage> {
  // O 'Future' armazena o estado da chamada de API
  late Future<List<Horta>> _hortasFuture;

  @override
  void initState() {
    super.initState();
    _hortasFuture = fetchHortas(); // Busca os dados na inicialização
  }

  // Permite que o FAB atualize a lista após a criação de uma nova Horta
  void _refreshHortas() {
    setState(() {
      _hortasFuture = fetchHortas();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const UserAccountsDrawerHeader(
              accountName: Text("Samuel Abreu"),
              accountEmail: Text("samuel@email.com"),
              currentAccountPicture: CircleAvatar(
                backgroundColor: Colors.green,
                child: Text(
                  "S",
                  style: TextStyle(fontSize: 40.0, color: Colors.white),
                ),
              ),
              decoration: BoxDecoration(color: Color(0xFF34495E)),
            ),
            ListTile(
              leading: const Icon(Icons.home),
              title: const Text('Minhas Hortas'),
              onTap: () => Navigator.pop(context), // Fecha o Drawer
            ),
            // TODO: Criar a tela de Modelos (Hortalicas)
          ],
        ),
      ),
      appBar: AppBar(title: const Text("Minhas Hortas")),
      body: FutureBuilder<List<Horta>>(
        future: _hortasFuture,
        builder: (context, snapshot) {
          // 1. Estado de Carregamento
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          // 2. Estado de Erro
          else if (snapshot.hasError) {
            return Center(child: SelectableText('Erro: ${snapshot.error}'));
          }
          // 3. Estado de Sucesso (com dados)
          else if (snapshot.hasData && snapshot.data!.isNotEmpty) {
            final List<Horta> hortas = snapshot.data!;

            return ListView.builder(
              padding: const EdgeInsets.only(top: 8, bottom: 80),
              itemCount: hortas.length,
              itemBuilder: (context, index) {
                final horta = hortas[index];
                return Card(
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                      vertical: 12,
                      horizontal: 16,
                    ),
                    title: Text(
                      horta.nome,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4.0),
                      child: Text(
                        horta.localizacao ?? 'Localização não informada',
                      ),
                    ),
                    trailing: const Icon(
                      Icons.chevron_right,
                      color: Colors.green,
                      size: 30,
                    ),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => HortaDetalhePage(horta: horta),
                        ),
                      );
                    },
                  ),
                );
              },
            );
          }
          // 4. Estado de Sucesso (sem dados)
          else {
            return const Center(child: Text('Nenhuma horta cadastrada.'));
          }
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          // Navega para a tela AddHortaPage
          final bool? hortaFoiCriada = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AddHortaPage()),
          );
          // Se a tela de AddHortaPage retornou 'true', atualiza a lista
          if (hortaFoiCriada == true) {
            _refreshHortas();
          }
        },
        backgroundColor: Colors.green,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
