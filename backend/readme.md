📚 README - Backend Django (Horta Fácil API)

Este documento contém as instruções atualizadas para configurar, rodar e gerenciar o Backend Django, que serve a API RESTful (DRF) para o aplicativo Flutter.

🚀 Rotina de Setup e Inicialização ("Golden State")

Esta é a rotina completa para criar o ambiente do zero e popular o banco de dados com os dados de demonstração.

1️⃣ Ativar o Ambiente Virtual (Venv)

Garanta que você está na pasta backend/.

# Se for a primeira vez no PowerShell, talvez precise permitir scripts:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned

# Ative o venv
.\venv\Scripts\activate

2️⃣ Instalar Dependências da API

Se você acabou de clonar o projeto, instale as dependências necessárias:

pip install django djangorestframework django-cors-headers


💡 Dica: Se houver um arquivo requirements.txt, utilize:

pip install -r requirements.txt

3️⃣ Criar e Popular o Banco de Dados

Esta é a parte crucial. A ordem deve ser seguida exatamente para evitar erros.

# (Opcional) Se já existir um 'db.sqlite3' com erro, delete-o primeiro:
del db.sqlite3

🧱 1. Criar as Tabelas no Banco de Dados

Este comando lê os arquivos em core/migrations/.

python manage.py migrate

🌱 2. Popular as Tabelas

Somente após o migrate, carregue os dados de demonstração do arquivo core/fixtures/seed_data.json.

python manage.py loaddata core/fixtures/seed_data.json

4️⃣ Rodar o Servidor

Com o ambiente virtual ativo:

python manage.py runserver


O servidor estará disponível em:
👉 http://127.0.0.1:8000/

🔧 Acesso e Estrutura
1️⃣ Acesso ao Django Admin (CRUD Completo)

O painel administrativo permite verificar e alterar todos os dados do sistema.

URL: http://127.0.0.1:8000/admin/

Usuário: admin

Senha: 123

2️⃣ Modelos Principais (5 Entidades)
Modelo	Função no Sistema
Horta	O projeto ou área física de cultivo.
Hortalica	O modelo técnico do cultivo (Ciclos, Espaçamentos, etc.).
Cultivo	O relacionamento entre Horta e Hortalica (a plantação ativa).
Colheita	Registro de quanto foi colhido.
Relatorio	Demonstração da lógica de Eficiência (Total Colhido / Total Planejado).
3️⃣ Endpoints da API (Lógica de Negócios)

O aplicativo Flutter consome as APIs no prefixo /api/.

Endpoint	Lógica de Negócio
/api/hortas/	Lista e criação de Hortas.
/api/cultivos/<id>/calendario/	Calcula e retorna o Calendário de Atividades.
/api/hortalicas/<id>/calcular-dimensionamento/	Calcula Módulos e Área Necessária.

✅ Pronto!
Seu ambiente está configurado, a API está rodando e o painel administrativo pode ser acessado para gerenciar os dados.