📱 README - Frontend Flutter (Horta Fácil)

Este repositório contém o aplicativo Flutter/Dart que consome a API RESTful do Django.
O objetivo é fornecer a interface visual (UI) para o planejamento e calendário de cultivos do sistema Horta Fácil.

⚙️ Requisitos

Antes de iniciar, garanta que os seguintes itens estão instalados e configurados:

Flutter SDK (instalado e adicionado ao PATH)

VS Code com a extensão Flutter

Backend Django rodando em http://127.0.0.1:8000/

Consulte o README do backend para instruções de configuração.

Google Chrome (usado como dispositivo de teste durante o desenvolvimento)

🚀 Como Iniciar o Frontend

Garanta que o Backend Django esteja em execução no Terminal 1 antes de continuar.

1️⃣ Instalar Dependências (Flutter)

Certifique-se de estar dentro da pasta do projeto frontend_flutter/:

# Instala todos os pacotes e dependências Dart
flutter pub get

2️⃣ Rodar o Aplicativo no Navegador

Usamos o Google Chrome para desenvolvimento rápido e teste da API.

# (Na pasta frontend_flutter/)
flutter run -d chrome


Durante o desenvolvimento:

🔄 Hot Reload (r): Atualiza o código instantaneamente.

🔁 Hot Restart (R): Recarrega completamente o estado do aplicativo.

✨ Funcionalidades Chave Implementadas
Funcionalidade	Implementação Técnica	Status
Tela de Splash	splash_screen.dart (delay de 3s)	✅ OK
Navegação	Fluxo: Splash ➔ Lista de Hortas ➔ Detalhe da Horta	✅ OK
Adicionar Horta	POST /api/hortas/ (em add_horta_page.dart)	✅ OK
Listar Hortas	GET /api/hortas/ (em main.dart)	✅ OK
Dimensionamento	GET /api/hortalicas/<id>/calcular-dimensionamento/	✅ OK
Calendário	GET /api/cultivos/<id>/calendario/	✅ OK
🧩 Estrutura de Arquivos Dart (/lib)
Arquivo	Função
main.dart	Gerencia a navegação inicial e exibe a lista de hortas (HortaListPage).
models.dart	Contém as classes de modelo (Horta, Hortalica, etc.) e as funções de comunicação com a API (fetchHortas(), fetchCalendario(), etc.).
splash_screen.dart	Tela de carregamento inicial (Splash Screen).
add_horta_page.dart	Formulário para criação de nova Horta via POST.
horta_detalhe_page.dart	Exibe detalhes de uma horta e lista seus cultivos.
hortalica_detalhe_calculo_page.dart	Mostra informações da hortaliça e executa o cálculo de dimensionamento.

✅ Tudo pronto!
O Frontend está configurado e pronto para se comunicar com o Backend Django.
Você pode começar a desenvolver novas telas, ajustar o design ou integrar novas funcionalidades da API.