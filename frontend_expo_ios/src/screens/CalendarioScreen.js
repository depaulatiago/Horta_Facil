// src/screens/CalendarioScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import MaterialIcon from '@expo/vector-icons/MaterialIcons';
import { fetchCultivos } from '../services/localDataService';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const CalendarioScreen = ({ navigation }) => {
  const [cultivos, setCultivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadCultivos = async () => {
    try {
      setError(null);
      const data = await fetchCultivos();
      setCultivos(data);
    } catch (err) {
      setError(err.message);
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCultivos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCultivos();
  };

  const gerarPDF = async () => {
    try {
      setLoading(true);
      
      // Cria conteúdo HTML para o PDF
      let htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #27AE60; text-align: center; }
              h2 { color: #1B4D3E; margin-top: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #27AE60; color: white; }
              tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>📅 Cronograma de Cultivos - Horta Fácil</h1>
            <p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            <table>
              <tr>
                <th>Horta</th>
                <th>Hortaliça</th>
                <th>Data de Plantio</th>
                <th>Data de Colheita</th>
                <th>Módulos</th>
                <th>Status</th>
              </tr>
      `;

      cultivos.forEach(item => {
        const dataInicio = new Date(item.data_inicio);
        const dataColheita = calcularDataColheita(item.data_inicio, item.ciclo_desenvolvimento);
        const hoje = new Date();
        const diasParaColheita = Math.floor((dataColheita - hoje) / (1000 * 60 * 60 * 24));
        const status = diasParaColheita < 0 ? '⚠️ Atrasado' : diasParaColheita === 0 ? '✓ Hoje' : `✓ ${diasParaColheita} dias`;

        htmlContent += `
          <tr>
            <td>${item.horta_nome}</td>
            <td>${item.hortalica_nome}</td>
            <td>${dataInicio.toLocaleDateString('pt-BR')}</td>
            <td>${dataColheita.toLocaleDateString('pt-BR')}</td>
            <td>${item.num_modulos}</td>
            <td>${status}</td>
          </tr>
        `;
      });

      htmlContent += `
            </table>
            <footer style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
              <p>Gerado pelo aplicativo Horta Fácil</p>
            </footer>
          </body>
        </html>
      `;

      // Salva o arquivo HTML com encoding UTF-8 explícito
      const filename = `cronograma_${new Date().getTime()}.html`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // Compartilha o arquivo
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/html',
        dialogTitle: 'Cronograma de Cultivos',
      });

      Alert.alert('Sucesso', 'Cronograma gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o cronograma: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularDataColheita = (dataInicio, cicloDesenvolvimento) => {
    const data = new Date(dataInicio);
    data.setDate(data.getDate() + (cicloDesenvolvimento * 7));
    return data;
  };

  const renderCultivoItem = ({ item }) => {
    const dataInicio = new Date(item.data_inicio);
    const dataColheita = calcularDataColheita(item.data_inicio, item.ciclo_desenvolvimento);
    const hoje = new Date();
    
    const diasParaColheita = Math.floor((dataColheita - hoje) / (1000 * 60 * 60 * 24));
    const status = diasParaColheita < 0 ? 'Atrasado' : diasParaColheita === 0 ? 'Hoje' : `${diasParaColheita} dias`;

    return (
      <View style={styles.cultivoCard}>
        <View style={styles.cultivoIcon}>
          <MaterialIcon name="eco" size={28} color="#27AE60" />
        </View>
        <View style={styles.cultivoConteudo}>
          <Text style={styles.cultivoNome}>{item.hortalica_nome}</Text>
          <Text style={styles.cultivoHorta}>
            <MaterialIcon name="home" size={12} color="#666" /> {item.horta_nome}
          </Text>
          <Text style={styles.cultivoData}>
            <MaterialIcon name="calendar-today" size={12} color="#666" /> Plantio: {dataInicio.toLocaleDateString('pt-BR')}
          </Text>
          <Text style={styles.cultivoData}>
            <MaterialIcon name="local-florist" size={12} color="#666" /> Colheita: {dataColheita.toLocaleDateString('pt-BR')}
          </Text>
          <Text style={[styles.cultivoStatus, diasParaColheita < 0 && styles.statusAtrasado]}>
            {diasParaColheita < 0 ? '⚠️ ' : '✓ '}{status}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando cultivos...</Text>
      </View>
    );
  }

  if (error && cultivos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCultivos}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerSubtitle}>Cronograma</Text>
            <Text style={styles.headerTitle}>Calendário de Cultivos</Text>
          </View>
        </View>
      </View>

      {cultivos.length > 0 && (
        <TouchableOpacity
          style={styles.pdfButton}
          onPress={gerarPDF}
          disabled={loading}
        >
          <MaterialIcon name="picture-as-pdf" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.pdfButtonText}>Gerar Cronograma</Text>
        </TouchableOpacity>
      )}

      {cultivos.length > 0 ? (
        <FlatList
          data={cultivos}
          renderItem={renderCultivoItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          scrollIndicatorInsets={{ right: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#27AE60']}
              tintColor="#27AE60"
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcon name="eco" size={48} color="#CCC" />
          <Text style={styles.emptyText}>Nenhum cultivo cadastrado</Text>
          <Text style={styles.emptySubtext}>
            Adicione cultivos às suas hortas para ver o cronograma
          </Text>
        </View>
      )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F8F5',
    marginBottom: 4,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  cultivoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  cultivoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  cultivoConteudo: {
    flex: 1,
  },
  cultivoNome: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 6,
  },
  cultivoHorta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  cultivoData: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '500',
  },
  cultivoStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27AE60',
    marginTop: 6,
  },
  statusAtrasado: {
    color: '#d32f2f',
  },
  pdfButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default CalendarioScreen;
