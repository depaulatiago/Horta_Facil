// lib/splash_screen.dart
import 'dart:async'; // Para o Timer
import 'package:flutter/material.dart';
import 'main.dart'; // Para navegar para a HortaListPage

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Inicia o timer
    Timer(const Duration(seconds: 3), () {
      // Reduzido para 3s
      if (mounted) {
        // Garante que o widget ainda está na tela
        // Navega para a HortaListPage
        // e remove a SplashScreen da pilha (para não poder voltar)
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const HortaListPage()),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5), // Fundo mais suave
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // 1. A LOGO
            // Certifique-se que o caminho 'assets/logo.png' está correto
            // e definido no pubspec.yaml
            Image.asset('assets/logo.png', width: 150),
            const SizedBox(height: 24),

            // 2. O INDICADOR DE CARREGAMENTO
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.green),
            ),
            const SizedBox(height: 16),
            Text(
              "Horta Fácil",
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
