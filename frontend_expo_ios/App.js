import React, { useState } from 'react';
import { View } from 'react-native';

// Importa as telas
import SplashScreen from './src/screens/SplashScreen';
import HortaListScreen from './src/screens/HortaListScreen';
import AddHortaScreen from './src/screens/AddHortaScreen';
import HortaDetalheScreen from './src/screens/HortaDetalheScreen';
import AddHortalicaScreen from './src/screens/AddHortalicaScreen';
import HortalicaDetalheScreen from './src/screens/HortalicaDetalheScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [screenParams, setScreenParams] = useState({});
  const [previousScreen, setPreviousScreen] = useState(null);

  const navigate = (screen, params = {}) => {
    setPreviousScreen(currentScreen);
    setScreenParams(params);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (previousScreen) {
      setCurrentScreen(previousScreen);
    } else {
      setCurrentScreen('HortaList');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return <SplashScreen navigation={{ replace: navigate }} />;
      case 'HortaList':
        return <HortaListScreen navigation={{ navigate }} />;
      case 'AddHorta':
        return <AddHortaScreen navigation={{ navigate, goBack }} />;
      case 'HortaDetalhe':
        return <HortaDetalheScreen navigation={{ navigate, goBack }} route={{ params: screenParams }} />;
      case 'AddHortalica':
        return <AddHortalicaScreen navigation={{ navigate, goBack }} route={{ params: screenParams }} />;
      case 'HortalicaDetalhe':
        return <HortalicaDetalheScreen navigation={{ navigate, goBack }} route={{ params: screenParams }} />;
      default:
        return <HortaListScreen navigation={{ navigate }} />;
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
}
