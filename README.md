# Frontend Mobile - Horta Fácil (Expo)

Aplicativo React Native com Expo para Android e iOS.

## Pré-requisitos

- Node.js 18+
- npm
- Expo Go no celular (Android/iOS) para testes rápidos
- Conta Expo para EAS Build

## Instalação

```bash
cd frontend_expo_ios
npm install
```

## Executar em desenvolvimento

```bash
# iniciar Metro
npx expo start

# limpar cache (quando necessário)
npx expo start -c
```

Atalhos úteis:

- Android: npx expo start --android
- iOS (macOS): npx expo start --ios
- Tunnel: npx expo start --tunnel

## Configuração EAS (já incluída no projeto)

Este projeto já possui:

- projectId no app.json
- perfis em eas.json: development, preview e production

Login:

```bash
npx eas login
npx eas whoami
```

## Build com EAS

### Android

```bash
# build de produção (atual: APK)
npx eas build --platform android --profile production

# build interno para testes
npx eas build --platform android --profile preview
```

### iOS

```bash
# build de produção
npx eas build --platform ios --profile production

# build interno para testes/TestFlight
npx eas build --platform ios --profile preview
```

## Envio para lojas

Depois que o build finalizar:

```bash
# Android (Play Console)
npx eas submit --platform android --profile production

# iOS (App Store Connect/TestFlight)
npx eas submit --platform ios --profile production
```

## Observações importantes

- O profile production Android está configurado como APK em eas.json.
- Para Google Play, o formato recomendado é AAB (app-bundle).
- Se alterar package, version, ou credenciais, gere novo build.

## Troubleshooting

### Build falha por cache/dependências

```bash
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```

### Erro de módulo não resolvido

```bash
npx expo install <nome-do-pacote>
npx expo start -c
```

### Erro de login EAS

```bash
npx eas logout
npx eas login
```

## Referências

- Expo: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction
- EAS Submit: https://docs.expo.dev/submit/introduction
