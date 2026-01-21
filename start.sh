#!/bin/bash

echo "🐳 Iniciando Backend Django com Docker..."
docker-compose up -d

echo ""
echo "⏳ Aguardando backend inicializar (5 segundos)..."
sleep 5

echo ""
echo "✅ Backend rodando em: http://localhost:8000/api/"
echo ""
echo "📱 Agora inicie o Expo manualmente em outro terminal:"
echo "   cd frontend_expo_ios"
echo "   npx expo start"
echo ""
echo "Para parar o backend: docker-compose down"
