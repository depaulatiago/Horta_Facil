# Frontend React Native Expo - Horta Fácil (iOS)

Projeto React Native com Expo configurado para rodar no iPhone.

## Pré-requisitos

1. **Node.js** instalado (versão 18 ou superior)
2. **Expo Go** instalado no seu iPhone ([App Store](https://apps.apple.com/app/expo-go/id982107779))
3. iPhone e computador na mesma rede Wi-Fi

## Como executar no iPhone

### 1. Instalar dependências (se necessário)

```bash
cd frontend_expo_ios
npm install
```

### 2. Iniciar o servidor Expo

```bash
npx expo start
```

### 3. Conectar no iPhone

Após executar o comando acima, você verá um QR code no terminal.

**Opção A - QR Code (recomendado):**
1. Abra o app **Expo Go** no seu iPhone
2. Toque em **"Scan QR Code"**
3. Escaneie o QR code que aparece no terminal

**Opção B - Link manual:**
1. Abra o app **Expo Go** no seu iPhone
2. Na aba "Projects", digite manualmente o endereço que aparece no terminal

## Desenvolvimento

### Comandos úteis

```bash
# Iniciar servidor Expo
npm start
# ou
npx expo start

# Iniciar com cache limpo
npx expo start --clear

# Iniciar no modo tunnel (útil quando na rede diferente)
npx expo start --tunnel

# Executar no iOS Simulator (requer macOS + Xcode)
npm run ios
```

### Estrutura do projeto

```
frontend_expo_ios/
├── App.js              # Componente principal
├── app.json            # Configuração do Expo
├── package.json        # Dependências do projeto
├── assets/             # Imagens, fontes, ícones
└── node_modules/       # Dependências instaladas
```

## Troubleshooting

### ❌ Problema: QR Code não funciona
**Soluções:**
- Verifique se iPhone e computador estão na mesma rede Wi-Fi
- Desative VPN se estiver usando
- Use modo tunnel: `npx expo start --tunnel`
- Verifique se o firewall não está bloqueando a porta

### ❌ Problema: Erro de conexão
**Soluções:**
```bash
# Reinicie o servidor
# Pressione Ctrl+C e execute novamente
npx expo start --clear

# Feche e abra o app Expo Go no iPhone
```

### ❌ Problema: Metro Bundler não inicia
**Soluções:**
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

### ❌ Problema: "Network response timed out"
**Soluções:**
- Use modo tunnel: `npx expo start --tunnel`
- Verifique configurações de firewall
- Conecte iPhone e computador na mesma rede Wi-Fi

## Próximos passos

### Adicionar navegação
```bash
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
```

### Adicionar ícones e fontes
```bash
npm install @expo/vector-icons
```

### Conectar com backend Django
```bash
npm install axios
```

## Compilar para App Store (requer conta Apple Developer)

### Instalar EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Build para iOS
```bash
# Build para produção
eas build --platform ios

# Build para TestFlight
eas build --platform ios --profile preview
```

## Recursos

- 📖 [Documentação Expo](https://docs.expo.dev/)
- ⚛️ [React Native Docs](https://reactnative.dev/)
- 📱 [Expo Go App](https://expo.dev/client)
- 🎨 [Expo Icons](https://icons.expo.fyi/)
- 🚀 [EAS Build](https://docs.expo.dev/build/introduction/)

## Estrutura do Backend

Este app pode se conectar ao backend Django em `/backend` usando:
- URL local: `http://192.168.x.x:8000/api/`
- Certifique-se de que o backend está rodando antes de testar

## Licença

Este projeto está sob a mesma licença do projeto Horta Fácil.
