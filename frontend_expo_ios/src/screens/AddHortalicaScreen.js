// src/screens/AddHortalicaScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { fetchHortalicas, createCultivo, calcularDimensionamento } from '../services/api';

const AddHortalicaScreen = ({ route, navigation }) => {
  const { horta } = route.params;
  
  const [hortalicas, setHortalicas] = useState([]);
  const [selectedHortalicaId, setSelectedHortalicaId] = useState(null);
  const [numModulos, setNumModulos] = useState('1');
  const [producaoSemanal, setProducaoSemanal] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculoLoading, setCalculoLoading] = useState(false);

  useEffect(() => {
    loadHortalicas();
  }, []);

  const loadHortalicas = async () => {
    try {
      const data = await fetchHortalicas();
      setHortalicas(data);
      if (data.length > 0) {
        setSelectedHortalicaId(data[0].id);
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCalculoDimensionamento = async () => {
    if (!producaoSemanal.trim()) {
      Alert.alert('Atenção', 'Informe a produção semanal desejada.');
      return;
    }

    setCalculoLoading(true);
    try {
      const resultado = await calcularDimensionamento(
        selectedHortalicaId,
        parseFloat(producaoSemanal)
      );
      setNumModulos(resultado.num_modulos.toString());
      Alert.alert(
        'Cálculo Realizado',
        `Módulos necessários: ${resultado.num_modulos}\nÁrea por módulo: ${resultado.area_por_modulo} m²`
      );
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setCalculoLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!selectedHortalicaId) {
      Alert.alert('Atenção', 'Selecione uma hortaliça.');
      return;
    }

    if (!numModulos.trim()) {
      Alert.alert('Atenção', 'Informe o número de módulos.');
      return;
    }

    if (!producaoSemanal.trim()) {
      Alert.alert('Atenção', 'Informe a produção semanal desejada.');
      return;
    }

    if (!dataInicio.trim()) {
      Alert.alert('Atenção', 'Informe a data de início (formato: YYYY-MM-DD).');
      return;
    }

    // Validar formato de data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataInicio)) {
      Alert.alert('Atenção', 'Formato de data inválido. Use: YYYY-MM-DD');
      return;
    }

    setSaving(true);

    try {
      const cultivoData = {
        horta: horta.id,
        hortalica: selectedHortalicaId,
        num_modulos: parseInt(numModulos),
        producao_semanal_desejada: parseFloat(producaoSemanal),
        data_inicio: dataInicio,
      };

      await createCultivo(cultivoData);

      Alert.alert(
        'Sucesso',
        'Hortaliça adicionada à horta com sucesso!',
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
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🥬 Adicionar Hortaliça</Text>
        <Text style={styles.headerSubtitle}>{horta.nome}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.label}>Selecione a Hortaliça *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedHortalicaId}
              onValueChange={(itemValue) => setSelectedHortalicaId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione uma hortaliça" value={null} />
              {hortalicas.map((h) => (
                <Picker.Item key={h.id} label={h.nome} value={h.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Produção Semanal Desejada (kg) *</Text>
          <View style={styles.calculoContainer}>
            <TextInput
              style={[styles.input, styles.calculoInput]}
              placeholder="Ex: 50"
              placeholderTextColor="#A0B0A0"
              value={producaoSemanal}
              onChangeText={setProducaoSemanal}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.calculoButton, calculoLoading && styles.buttonDisabled]}
              onPress={handleCalculoDimensionamento}
              disabled={calculoLoading}
            >
              {calculoLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.calculoButtonText}>📐</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            Clique no botão para calcular automaticamente os módulos necessários
          </Text>

          <Text style={styles.label}>Número de Módulos *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 4"
            placeholderTextColor="#A0B0A0"
            value={numModulos}
            onChangeText={setNumModulos}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Data de Início (YYYY-MM-DD) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2024-01-28"
            placeholderTextColor="#A0B0A0"
            value={dataInicio}
            onChangeText={setDataInicio}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSalvar}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>✓ Adicionar Hortaliça</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: '#AECDC1',
    borderRadius: 12,
    backgroundColor: '#F0F9F7',
    marginBottom: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#1B4D3E',
    fontWeight: '600',
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
    marginBottom: 8,
  },
  calculoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  calculoInput: {
    flex: 1,
    marginBottom: 0,
  },
  calculoButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  calculoButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  helperText: {
    fontSize: 12,
    color: '#52796F',
    marginBottom: 16,
    fontStyle: 'italic',
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footerText: {
    fontSize: 12,
    color: '#52796F',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});

export default AddHortalicaScreen;
