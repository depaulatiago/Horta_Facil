// /App.js
import 'react-native-gesture-handler'; // Importante: deve ser a primeira linha
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Importando nossas telas e o componente do menu
import LoginScreen from './src/screens/LoginScreen';
import MinhasHortasScreen from './src/screens/MinhasHortasScreen';
import CustomDrawerContent from './src/components/CustomDrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// --- Componente que define o menu lateral ---
function AppDrawer() {
  return (
    <Drawer.Navigator
      // Aqui dizemos para o menu usar nosso componente personalizado
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // Esconde o cabeçalho padrão
        drawerStyle: {
          width: '70%', // Menu ocupa 70% da tela
        },
        // Estilos para o item de menu ativo (quando estamos na tela)
        drawerActiveBackgroundColor: '#76C893', // Nosso verde primário
        drawerActiveTintColor: '#FFFFFF', // Texto branco quando ativo
        // Estilos para os itens inativos
        drawerInactiveTintColor: '#1D3557', // Nosso azul escuro
      }}
    >
      {/* Telas que aparecerão como opções no menu */}
      <Drawer.Screen name="Minhas Hortas" component={MinhasHortasScreen} />
      {/* Adicione outras telas aqui no futuro. Ex: */}
      {/* <Drawer.Screen name="Minha Conta" component={ContaScreen} /> */}
    </Drawer.Navigator>
  );
}

// --- Componente principal que gerencia o fluxo de telas ---
export default function App() {
  return (
    <NavigationContainer>
      {/* O Stack Navigator gerencia a troca entre Login e o App principal */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* "MainApp" é o nosso conjunto de telas que tem o menu lateral */}
        <Stack.Screen name="MainApp" component={AppDrawer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}