📱 README - Frontend Flutter (Horta Fácil Mobile)

Este repositório contém o aplicativo mobile Horta Fácil, desenvolvido em Flutter/Dart para consumo da API RESTful do Django. O objetivo é fornecer a interface visual (UI) para o planejamento e calendário de cultivos.

⚙️ Requisitos

Flutter SDK (instalado e no PATH).

VS Code com a extensão Flutter.

Backend Django rodando em http://127.0.0.1:8000/ (veja readme.md dentro da pasta backend).

Google Chrome (usado como emulador para desenvolvimento).

🚀 Como Iniciar o Frontend

Garanta que o Backend Django esteja rodando no Terminal 1 antes de continuar.

1. Instalar Dependências (Flutter)

Garanta que você está na pasta frontend_flutter/ do projeto.

# Instala os pacotes Dart (incluindo http, pdf e printing)
flutter pub get


2. Rodar o Aplicativo no Navegador (Desenvolvimento)

Usamos o Chrome para desenvolvimento rápido e teste da API.

# (Na pasta frontend_flutter/)
flutter run -d chrome


Hot Reload (r): Atualiza o código instantaneamente.

Hot Restart (R): Recarrega o estado completo do aplicativo.

✨ Funcionalidades Chave Implementadas

Funcionalidade

Implementação Técnica

Status

Tela de Splash

SplashScreen (5s de delay) com sua logo.

✅ OK

Navegação

Fluxo completo: Splash ➔ Horta List ➔ Cultivo Details.

✅ OK

Conexão API

http.get e http.post para as APIs do Django.

✅ OK

Dimensionamento

Cálculo: Chama /api/hortalicas/<id>/calcular-dimensionamento/.

✅ OK

Calendário

Lógica: Chama /api/cultivos/<id>/calendario/.

✅ OK

🚧 Estrutura de Arquivos Dart

main.dart: Gerencia a navegação inicial e a HortaListPage.

models.dart: Contém todas as classes Dart (Horta, Hortalica, Cultivo) e as funções de chamada fetchAPI().

horta_detalhe_page.dart: Lista os cultivos da horta e contém a lógica para gerar o calendário e dimensionamento.