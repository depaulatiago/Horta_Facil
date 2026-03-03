import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import MaterialIcon from '@expo/vector-icons/MaterialIcons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { initDatabase } from './src/services/database';

// Importa as telas
import SplashScreen from './src/screens/SplashScreen';
import HortaListScreen from './src/screens/HortaListScreen';
import CalendarioScreen from './src/screens/CalendarioScreen';
import AddHortaScreen from './src/screens/AddHortaScreen';
import HortaDetalheScreen from './src/screens/HortaDetalheScreen';
import AddHortalicaScreen from './src/screens/AddHortalicaScreen';
import HortalicaDetalheScreen from './src/screens/HortalicaDetalheScreen';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [navigationStack, setNavigationStack] = useState([]);
  const [mainTab, setMainTab] = useState('hortas'); // 'hortas' ou 'calendario'
  const [dbInitialized, setDbInitialized] = useState(false);
  const [isSwitchingTab, setIsSwitchingTab] = useState(false);
  const [tabTransition, setTabTransition] = useState(null);
  const tabTransitionProgress = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Inicializa o banco de dados quando o app carrega
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
        console.log('Banco de dados inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
      }
    };
    setupDatabase();
  }, []);

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
    if (isSwitchingTab || tab === mainTab) {
      return;
    }

    const targetScreen = tab === 'hortas' ? 'HortaList' : 'Calendario';
    const currentTabIndex = mainTab === 'hortas' ? 0 : 1;
    const targetTabIndex = tab === 'hortas' ? 0 : 1;
    const direction = targetTabIndex > currentTabIndex ? 'left' : 'right';
    const params = getCurrentParams();

    setIsSwitchingTab(true);
    setTabTransition({
      fromScreen: currentScreen,
      toScreen: targetScreen,
      fromParams: params,
      toParams: {},
      direction,
    });
    tabTransitionProgress.setValue(0);

    Animated.timing(tabTransitionProgress, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      setMainTab(tab);
      setNavigationStack([]);
      setCurrentScreen(targetScreen);
      setTabTransition(null);
      setIsSwitchingTab(false);
    });

  };

  const getCurrentParams = () => {
    if (navigationStack.length > 0) {
      return navigationStack[navigationStack.length - 1].params;
    }
    return {};
  };

  const renderScreenByName = (screen, params = {}) => {
    switch (screen) {
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

  const renderScreen = () => {
    const params = getCurrentParams();
    return renderScreenByName(currentScreen, params);
  };

  // Na tela Splash não mostra abas
  if (currentScreen === 'Splash') {
    return <View style={{ flex: 1 }}>{renderScreen()}</View>;
  }

  return (
    <View style={styles.appContainer}>
      {tabTransition ? (
        <View style={styles.transitionContainer}>
          <Animated.View
            style={[
              styles.transitionLayer,
              {
                transform: [
                  {
                    translateX: tabTransitionProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, tabTransition.direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH],
                    }),
                  },
                ],
              },
            ]}
          >
            {renderScreenByName(tabTransition.fromScreen, tabTransition.fromParams)}
          </Animated.View>

          <Animated.View
            style={[
              styles.transitionLayer,
              {
                transform: [
                  {
                    translateX: tabTransitionProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [tabTransition.direction === 'left' ? SCREEN_WIDTH : -SCREEN_WIDTH, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {renderScreenByName(tabTransition.toScreen, tabTransition.toParams)}
          </Animated.View>
        </View>
      ) : (
        <View style={styles.screenContainer}>{renderScreen()}</View>
      )}

      {/* Bottom Tab Navigation */}
      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: Math.max(8, insets.bottom),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabButton,
            mainTab === 'hortas' && styles.tabButtonActive,
          ]}
          onPress={() => switchTab('hortas')}
          disabled={isSwitchingTab}
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
          disabled={isSwitchingTab}
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
  appContainer: {
    flex: 1,
    backgroundColor: '#F0F9F7',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F0F9F7',
  },
  transitionContainer: {
    flex: 1,
    backgroundColor: '#F0F9F7',
    overflow: 'hidden',
  },
  transitionLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0F9F7',
  },
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
