# 🐳 Rodando com Docker

## Pré-requisitos
- Docker instalado: https://www.docker.com/products/docker-desktop
- Docker Compose (incluído no Docker Desktop)

## 🚀 Como rodar tudo junto

### 1. Na raiz do projeto, execute:

```bash
docker-compose up
```

Isso vai:
- ✅ Compilar a imagem do backend Django
- ✅ Instalar dependências Python
- ✅ Rodar migrations do banco de dados
- ✅ Carregar dados de exemplo
- ✅ Iniciar o servidor em `http://localhost:8000`
- ✅ Compilar a imagem do frontend Expo
- ✅ Instalar dependências Node
- ✅ Iniciar o servidor Expo em porta 19000

### 2. Quando tudo estiver rodando:

**Backend:** http://localhost:8000/api/hortas/

**Frontend (Expo):** 
- Abra outro terminal e vá para `frontend_expo_ios`
- Execute: `npx expo start`
- Escaneie o QR code com seu celular

## ⚠️ Problemas comuns

### "Port 8000 already in use"
```bash
# Parar containers antigos
docker-compose down

# Ou usar outra porta
docker-compose -f docker-compose.yml -p horta up
```

### "Cannot connect to Docker daemon"
Certifique-se de que o Docker Desktop está rodando.

### Rebuilar as imagens
```bash
docker-compose build --no-cache
docker-compose up
```

### Ver logs de um serviço
```bash
docker-compose logs backend
docker-compose logs frontend
```

## 📝 Parar os containers

```bash
docker-compose down
```

---

## 🔄 Fluxo de Desenvolvimento

1. Faça mudanças no código (backend ou frontend)
2. Os containers têm volumes configurados, então as mudanças são refletidas automaticamente
3. Recarregue o aplicativo no celular ou navegador

Para resetar o banco de dados:
```bash
docker-compose down -v
docker-compose up
```

