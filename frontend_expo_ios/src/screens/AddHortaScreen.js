// src/screens/AddHortaScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { createHorta } from '../services/api';

const AddHortaScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [areaTotal, setAreaTotal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'O nome da horta é obrigatório.');
      return;
    }

    setLoading(true);

    try {
      const hortaData = {
        nome: nome.trim(),
        localizacao: localizacao.trim() || null,
        area_total: areaTotal ? parseFloat(areaTotal) : null,
      };

      await createHorta(hortaData);
      
      Alert.alert(
        'Sucesso',
        'Horta criada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌱 Criar Horta</Text>
        <Text style={styles.headerSubtitle}>Comece seu cultivo agora</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.label}>Nome da Horta *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Horta da Escola"
            placeholderTextColor="#A0B0A0"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Localização</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Bairro Centro"
            placeholderTextColor="#A0B0A0"
            value={localizacao}
            onChangeText={setLocalizacao}
          />

          <Text style={styles.label}>Área Total (m²)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 50.5"
            placeholderTextColor="#A0B0A0"
            value={areaTotal}
            onChangeText={setAreaTotal}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSalvar}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>✓ Criar Horta</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Todos os campos com * são obrigatórios
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F7',
  },
  header: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    color: '#E8F8F5',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F8F5',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 10,
    marginTop: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F0F9F7',
    borderWidth: 1.5,
    borderColor: '#AECDC1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1B4D3E',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#27AE60',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 12,
    color: '#52796F',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});

export default AddHortaScreen;
