# 🚀 Quick Start - Horta Fácil iOS

## Iniciar no iPhone em 3 passos:

### 1️⃣ Instalar Expo Go no iPhone
- Baixe da App Store: https://apps.apple.com/app/expo-go/id982107779

### 2️⃣ Iniciar o servidor
```bash
cd frontend_expo_ios
npx expo start
```

### 3️⃣ Escanear QR Code
- Abra o Expo Go no iPhone
- Toque em "Scan QR Code"
- Aponte para o QR code que aparece no terminal

---

## ⚡ Dicas Rápidas

### Cache problems?
```bash
npx expo start --clear
```

### Different network?
```bash
npx expo start --tunnel
```

### Reload app
- Shake o iPhone
- Ou pressione `r` no terminal

---

## 📱 Verificar se está funcionando

Você deve ver na tela:
- 🌱 Título "Horta Fácil"
- Mensagem de boas-vindas
- Checkmarks verdes

---

## 🔥 Problemas comuns

**QR Code não funciona?**
- iPhone e PC devem estar na mesma WiFi
- Use: `npx expo start --tunnel`

**App não conecta?**
- Reinicie: Ctrl+C → `npx expo start`
- Feche e abra o Expo Go

**Erro ao instalar?**
```bash
rm -rf node_modules
npm install
```

---

Para documentação completa, veja: [README.md](./README.md)
