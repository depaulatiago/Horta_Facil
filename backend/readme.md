📚 README - Backend Django (Horta Fácil API)

Este documento contém as instruções atualizadas para configurar, rodar e gerenciar o Backend Django, que serve a API RESTful (DRF) para o aplicativo Flutter.

🚀 Rotina de Setup e Inicialização (Recomendada)

Esta rotina garante que o ambiente virtual esteja ativo, o banco de dados seja criado do zero e populado com os dados de demonstração (Hortas, Cultivos e Usuário Admin).

1. Ativar o Ambiente Virtual (Venv)

Garanta que você está na pasta backend/.

# Permite a execução de scripts no PowerShell (se necessário)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned

# Ativa o venv
.\venv\Scripts\activate


2. Instalar Dependências da API

Este passo é feito apenas na primeira vez ou se você adicionar novos pacotes.

# Com o (venv) ativo, instale os pacotes necessários:
pip install django djangorestframework django-cors-headers
# (Se houver um requirements.txt, use: pip install -r requirements.txt)


3. Reset e População de Dados (O Golden State)

Esta rotina garante que o usuário admin e todos os dados de Hortas/Cultivos estejam no banco.

# (venv) PS C:\...\backend>

# 1. DELETE o banco de dados antigo (para começar do zero)
del db.sqlite3

# 2. Crie as tabelas vazias
python manage.py migrate

# 3. Carregue os dados de demonstração (Hortaliças, Hortas, Cultivos e Usuário Admin)
# O arquivo 'seed_data.json' contém o estado perfeito para demonstração.
python manage.py loaddata seed_data.json


4. Rodar o Servidor

# (venv) PS C:\...\backend>
python manage.py runserver


Servidor: http://127.0.0.1:8000/

🔧 Acesso e Estrutura

1. Acesso ao Django Admin (CRUD Completo)

O painel administrativo é onde você pode verificar e alterar todos os dados.

URL: http://127.0.0.1:8000/admin/

Usuário: admin

Senha: 123

2. Modelos Principais (5 Entidades)

Modelo

Função no Sistema

Horta

O projeto ou área física de cultivo.

Hortaliça

O modelo técnico do cultivo (Ciclos, Espaçamentos, Produtividade).

Cultivo

O relacionamento entre Horta e Hortaliça (a plantação ativa). Antiga Produção.

Colheita

Registro de quanto foi colhido.

Relatório

Demonstração da lógica de Eficiência (Total Colhido / Total Planejado).

3. Endpoints da API (Lógica de Negócios)

O aplicativo Flutter consome as APIs no prefixo /api/:

Endpoint

Lógica de Negócio

/api/hortas/

Lista/Criação de Hortas.

/api/cultivos/<id>/calendario/

Calcula e retorna o Calendário de Atividades.

/api/hortalicas/<id>/calcular-dimensionamento/

Calcula Módulos e Área Necessária (Lógica da Planilha).