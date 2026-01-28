# Horta Fácil

Sistema web para planejamento, dimensionamento e gerenciamento de hortas comerciais, domésticas e comunitárias.

---

## Como rodar o projeto

### Requisitos

- Python 3.12+
- Node.js 16+
- Docker (opcional)

---

## 🚀 Opção 1: Rodar sem Docker (Recomendado para desenvolvimento)

### 1. Backend (Django)

```bash
# Entre na pasta do backend
cd backend

# Crie e ative o virtual environment
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Rode as migrations
python manage.py migrate

# Carregue dados de exemplo (opcional)
python manage.py loaddata core/fixtures/seed_data.json

# Inicie o servidor
python manage.py runserver 0.0.0.0:8000
```

Backend rodando em: **http://localhost:8000/api/**

### 2. Frontend (Expo Web)

Em outro terminal:

```bash
# Entre na pasta do frontend
cd frontend_expo_ios

# Instale as dependências
npm install

# Inicie o servidor web
npm start

# Escolha 'w' para rodar no navegador
```

Frontend rodando em: **http://localhost:19006**

---

## 🐳 Opção 2: Rodar com Docker

```bash
# Na raiz do projeto
docker-compose up
```

Isso inicia o backend em **http://localhost:8000/api/**

Depois abra outro terminal para o frontend:

```bash
cd frontend_expo_ios
npm start
# Escolha 'w' para web
```

---

## 📝 Notas importantes

- **Para voltar a ativar o venv** em novos terminais, execute:
  ```bash
  source venv/bin/activate  # ou: cd backend && source venv/bin/activate
  ```

- **Frontend precisa que o backend esteja rodando** para funcionar corretamente

- **Banco de dados**: SQLite (arquivo `db.sqlite3` na pasta `backend/`)

---

Projeto criado como extensão universitária.