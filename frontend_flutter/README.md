📱 README - Frontend Flutter (Horta Fácil)
Este repositório contém o aplicativo em Flutter/Dart para consumo da API RESTful do Django. O objetivo é fornecer a interface visual (UI) para o planejamento e calendário de cultivos.

---

### ⚙️ Requisitos

* Flutter SDK (instalado e no PATH).
* VS Code com a extensão Flutter.
* Backend Django rodando em `http://127.0.0.1:8000/` (veja o README do back-end).
* Google Chrome (usado como dispositivo de teste).

---

### 🚀 Como Iniciar o Frontend

Garanta que o Backend Django esteja rodando no Terminal 1 antes de continuar.

#### 1. Instalar Dependências (Flutter)

Garanta que você está na pasta `frontend_flutter/` do projeto.

```bash
# Instala os pacotes Dart (incluindo http)
flutter pub get
2. Rodar o Aplicativo no NavegadorUsamos o Chrome para desenvolvimento rápido e teste da API.Bash# (Na pasta frontend_flutter/)
flutter run -d chrome
Hot Reload (r): Atualiza o código instantaneamente.Hot Restart (R): Recarrega o estado completo do aplicativo.✨ Funcionalidades Chave ImplementadasFuncionalidadeImplementação TécnicaStatusTela de Splashsplash_screen.dart (3s de delay).✅ OKNavegaçãoFluxo: Splash ➔ Lista de Hortas ➔ Detalhe da Horta.✅ OKAdicionar HortaPOST /api/hortas/ (em add_horta_page.dart).✅ OKListar HortasGET /api/hortas/ (em main.dart).✅ OKDimensionamentoGET /api/hortalicas/<id>/calcular-dimensionamento/✅ OKCalendárioGET /api/cultivos/<id>/calendario/✅ OK🚧 Estrutura de Arquivos Dart (lib/)main.dart: Gerencia a navegação inicial e a tela HortaListPage.models.dart: Contém todas as classes de modelo (Horta, Hortalica, etc.) e todas as funções de chamada fetch da API (ex: fetchHortas()).splash_screen.dart: Tela de carregamento inicial.add_horta_page.dart: Formulário para criar uma nova Horta via POST.horta_detalhe_page.dart: Lista os cultivos da horta e dispara a lógica de fetchCalendario().hortalica_detalhe_calculo_page.dart: Tela de detalhes da hortaliça e formulário para chamar a API de calcular-dimensionamento.