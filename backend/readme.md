📚 README - Backend Django (Horta Fácil API)
Este documento contém as instruções atualizadas para configurar, rodar e gerenciar o Backend Django, que serve a API RESTful (DRF) para o aplicativo Flutter [cite: 📚 README - Backend Django (Horta Fácil API)].

🚀 Rotina de Setup e Inicialização (O "Golden State")

Esta é a rotina completa para criar o ambiente do zero e popular o banco de dados com os dados de demonstração.

1. Ativar o Ambiente Virtual (Venv)

Garanta que você está na pasta backend/.

# Se for a primeira vez no PowerShell, talvez precise permitir scripts:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned

# Ative o venv
.\venv\Scripts\activate


2. Instalar Dependências da API

Se você acabou de clonar o projeto, instale as dependências.

# Instale os pacotes necessários:
pip install django djangorestframework django-cors-headers


(Se você tiver um requirements.txt, use pip install -r requirements.txt)

3. Criar e Popular o Banco de Dados

Esta é a parte crucial. A ordem deve ser seguida exatamente para evitar erros.

# (Opcional) Se já existir um 'db.sqlite3' com erro, delete-o primeiro:
# del db.sqlite3

# 1. CRIE AS TABELAS no banco de dados
# Este comando lê os arquivos em 'core/migrations/'
python manage.py migrate

# 2. POPULE AS TABELAS (somente após o migrate)
# Carrega os dados de 'core/fixtures/seed_data.json'
python manage.py loaddata core/fixtures/seed_data.json


4. Rodar o Servidor

# Com o (venv) ativo:
python manage.py runserver


O servidor estará disponível em http://127.0.0.1:8000/ [cite: 4. Rodar o Servidor].

🔧 Acesso e Estrutura

1. Acesso ao Django Admin (CRUD Completo)

O painel administrativo é onde você pode verificar e alterar todos os dados [cite: 1. Acesso ao Django Admin (CRUD Completo)].

URL: http://127.0.0.1:8000/admin/ [cite: 1. Acesso ao Django Admin (CRUD Completo)]

Usuário: admin [cite: 1. Acesso ao Django Admin (CRUD Completo)]

Senha: 123 [cite: 1. Acesso ao Django Admin (CRUD Completo)]

2. Modelos Principais (5 Entidades)

Modelo

Função no Sistema [cite: 2. Modelos Principais (5 Entidades)]

Horta

O projeto ou área física de cultivo.

Hortalica

O modelo técnico do cultivo (Ciclos, Espaçamentos, etc.).

Cultivo

O relacionamento entre Horta e Hortalica (a plantação ativa).

Colheita

Registro de quanto foi colhido.

Relatorio

Demonstração da lógica de Eficiência (Total Colhido / Total Planejado).

3. Endpoints da API (Lógica de Negócios)

O aplicativo Flutter consome as APIs no prefixo /api/ [cite: 3. Endpoints da API (Lógica de Negócios)].

Endpoint

Lógica de Negócio [cite: 3. Endpoints da API (Lógica de Negócios)]

/api/hortas/

Lista/Criação de Hortas.

/api/cultivos/<id>/calendario/

Calcula e retorna o Calendário de Atividades.

/api/hortalicas/<id>/calcular-dimensionamento/

Calcula Módulos e Área Necessária.