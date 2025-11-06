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
    // Inicia o timer de 5 segundos
    Timer(const Duration(seconds: 5), () {
      // Quando o timer acabar, navega para a HortaListPage
      // e remove a SplashScreen da pilha (para não poder voltar)
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const HortaListPage()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // Fundo branco
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // 1. A LOGO
            // Certifique-se que o caminho 'assets/logo.png' está correto
            Image.asset('assets/logo.png', width: 150), 
            const SizedBox(height: 20),
            
            // 2. O INDICADOR DE CARREGAMENTO
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.green),
            ),
          ],
        ),
      ),
    );
  }
}