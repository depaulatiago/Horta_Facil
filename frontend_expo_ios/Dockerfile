FROM node:20-slim

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm install

# Copiar código
COPY . .

# Expor portas do Expo
EXPOSE 19000 19001

# Comando para rodar Expo
CMD ["npm", "start"]
