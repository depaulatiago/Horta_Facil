// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Text } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('HortaList');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/logo.png')} 
        style={styles.logo}
      />
      <Text style={styles.title}>Horta Fácil</Text>
      <Text style={styles.subtitle}>Seu cultivo, sua colheita</Text>
      <ActivityIndicator 
        size="large" 
        color="#27AE60" 
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    borderRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#27AE60',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#52796F',
    marginBottom: 32,
    fontWeight: '500',
  },
  loader: {
    marginTop: 16,
  },
});

export default SplashScreen;
