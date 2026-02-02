import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MaterialIcon from '@expo/vector-icons/MaterialIcons';

// Importa as telas
import SplashScreen from './src/screens/SplashScreen';
import HortaListScreen from './src/screens/HortaListScreen';
import CalendarioScreen from './src/screens/CalendarioScreen';
import AddHortaScreen from './src/screens/AddHortaScreen';
import HortaDetalheScreen from './src/screens/HortaDetalheScreen';
import AddHortalicaScreen from './src/screens/AddHortalicaScreen';
import HortalicaDetalheScreen from './src/screens/HortalicaDetalheScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [navigationStack, setNavigationStack] = useState([]);
  const [mainTab, setMainTab] = useState('hortas'); // 'hortas' ou 'calendario'

  const navigate = (screen, params = {}) => {
    setNavigationStack((prev) => [...prev, { screen, params }]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (navigationStack.length > 0) {
      const newStack = [...navigationStack];
      newStack.pop(); // Remove a tela atual
      if (newStack.length > 0) {
        const previous = newStack[newStack.length - 1];
        setNavigationStack(newStack);
        setCurrentScreen(previous.screen);
      } else {
        setNavigationStack([]);
        setCurrentScreen(mainTab === 'hortas' ? 'HortaList' : 'Calendario');
      }
    } else {
      setCurrentScreen(mainTab === 'hortas' ? 'HortaList' : 'Calendario');
    }
  };

  const switchTab = (tab) => {
    setMainTab(tab);
    setNavigationStack([]);
    if (tab === 'hortas') {
      setCurrentScreen('HortaList');
    } else if (tab === 'calendario') {
      setCurrentScreen('Calendario');
    }
  };

  const getCurrentParams = () => {
    if (navigationStack.length > 0) {
      return navigationStack[navigationStack.length - 1].params;
    }
    return {};
  };

  const renderScreen = () => {
    const params = getCurrentParams();
    
    switch (currentScreen) {
      case 'Splash':
        return <SplashScreen navigation={{ replace: navigate }} />;
      case 'HortaList':
        return <HortaListScreen navigation={{ navigate }} />;
      case 'Calendario':
        return <CalendarioScreen navigation={{ navigate }} />;
      case 'AddHorta':
        return <AddHortaScreen navigation={{ navigate, goBack }} />;
      case 'HortaDetalhe':
        return <HortaDetalheScreen navigation={{ navigate, goBack }} route={{ params }} />;
      case 'AddHortalica':
        return <AddHortalicaScreen navigation={{ navigate, goBack }} route={{ params }} />;
      case 'HortalicaDetalhe':
        return <HortalicaDetalheScreen navigation={{ navigate, goBack }} route={{ params }} />;
      default:
        return <HortaListScreen navigation={{ navigate }} />;
    }
  };

  // Na tela Splash não mostra abas
  if (currentScreen === 'Splash') {
    return <View style={{ flex: 1 }}>{renderScreen()}</View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      {/* Bottom Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            mainTab === 'hortas' && styles.tabButtonActive,
          ]}
          onPress={() => switchTab('hortas')}
        >
          <MaterialIcon 
            name="eco" 
            size={28}
            color={mainTab === 'hortas' ? '#27AE60' : '#999'}
          />
          <Text style={[
            styles.tabLabel,
            mainTab === 'hortas' && styles.tabLabelActive,
          ]}>
            Minhas Hortas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            mainTab === 'calendario' && styles.tabButtonActive,
          ]}
          onPress={() => switchTab('calendario')}
        >
          <MaterialIcon 
            name="calendar-today" 
            size={28}
            color={mainTab === 'calendario' ? '#27AE60' : '#999'}
          />
          <Text style={[
            styles.tabLabel,
            mainTab === 'calendario' && styles.tabLabelActive,
          ]}>
            Cronograma
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 8,
    paddingTop: 8,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabIconActive: {
    fontSize: 28,
  },
  tabLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#4CAF50',
    fontWeight: '700',
  },
});
