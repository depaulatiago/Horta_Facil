import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importando nossas telas
import LoginScreen from './src/screens/LoginScreen';
import MinhasHortasScreen from './src/screens/MinhasHortasScreen';

const Stack = createStackNavigator();

// --- Componente principal que gerencia o fluxo de telas ---
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerStyle: {
            backgroundColor: '#76C893',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MinhasHortas" 
          component={MinhasHortasScreen}
          options={{ title: 'Minhas Hortas' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}