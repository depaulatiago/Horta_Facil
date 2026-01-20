# Correção de Erros - Frontend Expo iOS

## ❌ Problema
Erro: `Exception in HostFunction: TypeError: expected dynamic type 'boolean', but had type 'string'`

## ✅ Soluções Aplicadas

### 1. Versões de Dependências Corrigidas
As versões incompatíveis foram ajustadas para serem compatíveis com Expo SDK 54:

```json
{
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/native-stack": "^6.9.17",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-safe-area-context": "^4.10.0",
  "react-native-screens": "^3.31.0"
}
```

### 2. Props Booleanas Corrigidas
Adicionado `autoCorrect={false}` em todos os TextInput:

```javascript
<TextInput
  autoCorrect={false}  // ✅ Booleano correto
  // ...
/>
```

### 3. SafeAreaProvider Adicionado
```javascript
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {/* ... */}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

### 4. headerLeft Corrigido
```javascript
options={{ 
  title: 'Minhas Hortas',
  headerLeft: () => null, // ✅ Função em vez de null direto
}}
```

## 🚀 Como Usar

### 1. Reinstalar dependências
```bash
cd frontend_expo_ios
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 2. Limpar cache e iniciar
```bash
npx expo start --clear
```

### 3. Se ainda houver problemas
```bash
# Limpar cache do Metro Bundler
npx expo start -c

# Ou resetar completamente
watchman watch-del-all
rm -rf node_modules
npm install --legacy-peer-deps
npx expo start --clear
```

## 📝 Arquivos Modificados

1. ✅ `package.json` - Versões corrigidas
2. ✅ `App.js` - SafeAreaProvider e headerLeft
3. ✅ `src/screens/AddHortaScreen.js` - autoCorrect
4. ✅ `src/screens/HortalicaDetalheScreen.js` - autoCorrect

## ⚠️ Notas Importantes

- Use `--legacy-peer-deps` ao instalar pacotes
- O Expo pode avisar sobre versões diferentes, mas essas são as compatíveis
- Se o erro persistir, limpe o cache: `npx expo start -c`

## 🔍 Causa Raiz do Erro

O erro ocorria porque:
1. **Props incorretas**: Algumas props booleanas estavam sendo passadas implicitamente
2. **Versões incompatíveis**: react-navigation v7 não é compatível com Expo SDK 54
3. **SafeAreaProvider ausente**: Necessário para iOS moderno

Todas essas questões foram corrigidas! ✅
