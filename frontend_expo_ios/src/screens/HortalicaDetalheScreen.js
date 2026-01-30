// src/screens/HortalicaDetalheScreen.js
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
import { calcularDimensionamento, deleteCultivo } from '../services/api';

const HortalicaDetalheScreen = ({ route, navigation }) => {
  const { cultivoDetalhado } = route.params;
  const { cultivo, hortalica } = cultivoDetalhado;

  const [producaoSemanal, setProducaoSemanal] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const cicloTotal =
    hortalica.ciclo_desenvolvimento +
    hortalica.ciclo_colheita +
    hortalica.ciclo_limpeza;

  const handleCalcular = async () => {
    const producao = parseFloat(producaoSemanal);

    if (!producao || producao <= 0) {
      Alert.alert(
        'Atenção',
        'Por favor, insira um valor válido para a Produção Semanal.'
      );
      return;
    }

    setLoading(true);

    try {
      const data = await calcularDimensionamento(hortalica.id, producao);
      setResultado(data);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirCultivo = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o cultivo de "${hortalica.nome}"? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCultivo(cultivo.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExcluirCultivo} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>🗑️ Excluir</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>{hortalica.nome}</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Informações da Hortaliça */}
        <View style={styles.infoCard}>
          <Text style={styles.title}>{hortalica.nome}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo de Plantio:</Text>
            <Text style={styles.infoValue}>{hortalica.tipo_plantio}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ciclo Total:</Text>
            <Text style={styles.infoValue}>{cicloTotal} semanas</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ciclo Desenvolvimento:</Text>
            <Text style={styles.infoValue}>
              {hortalica.ciclo_desenvolvimento} semanas
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ciclo Colheita:</Text>
            <Text style={styles.infoValue}>
              {hortalica.ciclo_colheita} semanas
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ciclo Limpeza:</Text>
            <Text style={styles.infoValue}>
              {hortalica.ciclo_limpeza} semanas
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Produtividade Esperada:</Text>
            <Text style={styles.infoValue}>
              {hortalica.produtividade_esperada} /módulo
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Área por Módulo:</Text>
            <Text style={styles.infoValue}>{hortalica.area_modulo} m²</Text>
          </View>
        </View>

        {/* Seção de Dimensionamento */}
        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Calcular Dimensionamento</Text>

        <Text style={styles.label}>Produção Semanal Desejada</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 100.0"
          value={producaoSemanal}
          onChangeText={setProducaoSemanal}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCalcular}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Calcular</Text>
          )}
        </TouchableOpacity>

        {/* Resultado */}
        {resultado && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultado do Cálculo:</Text>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Número de Módulos:</Text>
              <Text style={styles.resultValue}>
                {resultado.num_modulos_calculado}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Área Necessária:</Text>
              <Text style={styles.resultValue}>
                {resultado.area_total_calculada.toFixed(2)} m²
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#27AE60',
    padding: 16,
    paddingTop: 50,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    flex: 1,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 16,
    color: '#1B5E20',
    flex: 1,
  },
  resultValue: {
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
});

export default HortalicaDetalheScreen;
