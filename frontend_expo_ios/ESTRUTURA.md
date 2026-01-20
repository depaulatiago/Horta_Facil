# Estrutura do Projeto - Frontend React Native

## 📁 Estrutura de Pastas

```
frontend_expo_ios/
├── App.js                          # App principal com navegação
├── package.json                    # Dependências
├── assets/                         # Recursos (imagens, ícones)
└── src/
    ├── screens/                    # Telas do app
    │   ├── SplashScreen.js        # Tela inicial (3s)
    │   ├── HortaListScreen.js     # Lista de hortas
    │   ├── AddHortaScreen.js      # Adicionar nova horta
    │   ├── HortaDetalheScreen.js  # Detalhes da horta + cultivos
    │   └── HortalicaDetalheScreen.js  # Detalhes + cálculo
    ├── services/
    │   └── api.js                 # Todas as chamadas de API
    └── components/                 # Componentes reutilizáveis (futuro)
```

## 🎯 Funcionalidades Implementadas

### ✅ Telas Criadas

1. **SplashScreen** - Tela de abertura com logo
2. **HortaListScreen** - Lista todas as hortas com pull-to-refresh
3. **AddHortaScreen** - Formulário para criar nova horta
4. **HortaDetalheScreen** - Mostra cultivos da horta + gerar calendário
5. **HortalicaDetalheScreen** - Detalhes da hortaliça + cálculo de dimensionamento

### ✅ Funcionalidades de API

- ✅ `fetchHortas()` - Buscar todas as hortas
- ✅ `createHorta()` - Criar nova horta
- ✅ `fetchHortalicas()` - Buscar modelos de cultivo
- ✅ `fetchCultivos()` - Buscar cultivos de uma horta
- ✅ `fetchCultivosDetalhados()` - Combinar cultivos + hortaliças
- ✅ `fetchCalendario()` - Gerar calendário de atividades
- ✅ `calcularDimensionamento()` - Calcular módulos necessários

### ✅ Navegação Completa

```
Splash (3s)
  ↓
HortaList
  ├→ AddHorta → (volta)
  └→ HortaDetalhe
      ├→ [Modal Calendário]
      └→ HortalicaDetalhe
          └→ [Cálculo de Dimensionamento]
```

## 🔧 Configuração da API

**Arquivo:** `src/services/api.js`

```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

**Para testar no iPhone:**
1. Descubra o IP do seu computador:
   ```bash
   ifconfig  # Linux/Mac
   ipconfig  # Windows
   ```
2. Altere para:
   ```javascript
   const API_BASE_URL = 'http://192.168.X.X:8000/api';
   ```

## 📱 Como Executar

### 1. Instalar dependências (se necessário)
```bash
cd frontend_expo_ios
npm install
```

### 2. Iniciar o backend Django
```bash
cd ../backend
python manage.py runserver 0.0.0.0:8000
```

### 3. Iniciar o Expo
```bash
cd ../frontend_expo_ios
npx expo start
```

### 4. Escanear QR Code no iPhone
- Abra o Expo Go
- Escaneie o QR code
- Aguarde 3 segundos (SplashScreen)
- Navegue pelo app!

## 🎨 Características do Design

- ✅ Cores consistentes (verde #4CAF50)
- ✅ Cards com sombra e bordas arredondadas
- ✅ Loading states em todas as telas
- ✅ Pull-to-refresh na lista
- ✅ Modal para calendário
- ✅ Feedback visual (alerts, loaders)
- ✅ Keyboard avoiding em formulários
- ✅ SafeAreaView para iOS

## 📦 Dependências Principais

```json
{
  "axios": "^1.x",                          // Chamadas HTTP
  "@react-navigation/native": "^6.x",       // Navegação
  "@react-navigation/native-stack": "^6.x", // Stack Navigator
  "react-native-screens": "^4.x",           // Telas nativas
  "react-native-safe-area-context": "^4.x"  // SafeArea
}
```

## 🔄 Fluxo Completo de Uso

1. **App Abre** → SplashScreen (3s)
2. **Lista de Hortas** → Mostra todas as hortas
3. **Adicionar Horta** → Cria nova horta (nome, local, área)
4. **Ver Horta** → Lista cultivos da horta
5. **Ver Calendário** → Modal com datas de plantio/colheita
6. **Ver Hortaliça** → Detalhes do modelo + cálculo
7. **Calcular** → Informa produção desejada → Recebe módulos necessários

## 🆘 Troubleshooting

### Erro de rede / CORS
- Verifique se o backend está rodando
- Use o IP correto do computador
- Certifique-se que iPhone e PC estão na mesma rede

### Tela branca
- Verifique o console do Metro Bundler
- Limpe o cache: `npx expo start --clear`

### Navegação não funciona
- Verifique se todas as dependências foram instaladas
- Reinicie o app no Expo Go

## 📝 Próximos Passos (Opcional)

- [ ] Adicionar autenticação de usuário
- [ ] Criar tela de perfil
- [ ] Adicionar opção de editar/deletar hortas
- [ ] Adicionar opção de criar novos cultivos
- [ ] Melhorar formatação de datas (usar date-fns)
- [ ] Adicionar filtros e busca
- [ ] Adicionar gráficos de produção
- [ ] Modo offline com AsyncStorage
- [ ] Notificações push para atividades

---

✨ **Projeto React Native completo e funcional!** ✨
