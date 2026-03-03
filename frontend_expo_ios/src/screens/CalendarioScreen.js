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
  Image,
} from 'react-native';
import MaterialIcon from '@expo/vector-icons/MaterialIcons';
import { fetchCultivos } from '../services/localDataService';
import * as Print from 'expo-print';
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

      const hoje = new Date();
      const totalCultivos = cultivos.length;
      const atrasados = cultivos.filter((item) => {
        const dataColheita = calcularDataColheita(item.data_inicio, item.ciclo_desenvolvimento);
        return Math.floor((dataColheita - hoje) / (1000 * 60 * 60 * 24)) < 0;
      }).length;
      const colheitaHoje = cultivos.filter((item) => {
        const dataColheita = calcularDataColheita(item.data_inicio, item.ciclo_desenvolvimento);
        return Math.floor((dataColheita - hoje) / (1000 * 60 * 60 * 24)) === 0;
      }).length;
      const noPrazo = totalCultivos - atrasados - colheitaHoje;
      
      // Cria conteúdo HTML para o PDF
      let htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              * { box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                margin: 0;
                color: #1f2937;
                background: #f5faf7;
              }
              .page {
                padding: 28px;
              }
              .header {
                background: linear-gradient(135deg, #1f9d58 0%, #27ae60 45%, #56c779 100%);
                color: #ffffff;
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 8px 20px rgba(39, 174, 96, 0.22);
              }
              .title {
                margin: 0;
                font-size: 28px;
                font-weight: 800;
                letter-spacing: 0.2px;
                color: #d9fbe5;
              }
              .subtitle {
                margin: 8px 0 0;
                font-size: 13px;
                opacity: 0.95;
              }
              .summary {
                margin: 18px 0 20px;
                width: 100%;
                border-collapse: separate;
                border-spacing: 12px 0;
              }
              .summary td {
                width: 25%;
                border: none;
                padding: 0;
                vertical-align: top;
              }
              .summary-card {
                background: #ffffff;
                border-radius: 12px;
                padding: 14px;
                border: 1px solid #e5efe8;
                box-shadow: 0 3px 10px rgba(16, 24, 40, 0.06);
              }
              .summary-label {
                margin: 0;
                font-size: 11px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.7px;
              }
              .summary-value {
                margin: 6px 0 0;
                font-size: 24px;
                font-weight: 700;
                color: #0f5132;
              }
              .section-title {
                margin: 20px 0 10px;
                font-size: 15px;
                font-weight: 700;
                color: #14532d;
              }
              .table-wrapper {
                background: #ffffff;
                border-radius: 14px;
                border: 1px solid #dfeee3;
                overflow: hidden;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th {
                background: #1f8a4d;
                color: #ffffff;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 12px 10px;
                text-align: left;
              }
              td {
                border-bottom: 1px solid #ecf3ee;
                padding: 11px 10px;
                font-size: 12px;
                color: #334155;
              }
              tr:nth-child(even) { background-color: #f8fcf9; }
              .status {
                display: inline-block;
                font-weight: 700;
                font-size: 11px;
                padding: 4px 9px;
                border-radius: 999px;
              }
              .status-ok {
                background: #dcfce7;
                color: #166534;
              }
              .status-hoje {
                background: #e0f2fe;
                color: #0c4a6e;
              }
              .status-atrasado {
                background: #fee2e2;
                color: #991b1b;
              }
              .footer {
                margin-top: 18px;
                text-align: center;
                font-size: 11px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="page">
              <div class="header">
                <h1 class="title">Cronograma de Cultivos</h1>
                <p class="subtitle">Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} • Horta Fácil</p>
              </div>

              <table class="summary">
                <tr>
                  <td>
                    <div class="summary-card">
                      <p class="summary-label">Total de cultivos</p>
                      <p class="summary-value">${totalCultivos}</p>
                    </div>
                  </td>
                  <td>
                    <div class="summary-card">
                      <p class="summary-label">No prazo</p>
                      <p class="summary-value">${noPrazo}</p>
                    </div>
                  </td>
                  <td>
                    <div class="summary-card">
                      <p class="summary-label">Colheita hoje</p>
                      <p class="summary-value">${colheitaHoje}</p>
                    </div>
                  </td>
                  <td>
                    <div class="summary-card">
                      <p class="summary-label">Atrasados</p>
                      <p class="summary-value">${atrasados}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <h2 class="section-title">Planejamento detalhado</h2>
              <div class="table-wrapper">
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
        const diasParaColheita = Math.floor((dataColheita - hoje) / (1000 * 60 * 60 * 24));
        const status = diasParaColheita < 0 ? 'Atrasado' : diasParaColheita === 0 ? 'Hoje' : `${diasParaColheita} dias`;
        const statusClass = diasParaColheita < 0 ? 'status-atrasado' : diasParaColheita === 0 ? 'status-hoje' : 'status-ok';

        htmlContent += `
          <tr>
            <td>${item.horta_nome}</td>
            <td>${item.hortalica_nome}</td>
            <td>${dataInicio.toLocaleDateString('pt-BR')}</td>
            <td>${dataColheita.toLocaleDateString('pt-BR')}</td>
            <td>${item.num_modulos}</td>
            <td><span class="status ${statusClass}">${status}</span></td>
          </tr>
        `;
      });

      htmlContent += `
                </table>
              </div>
              <div class="footer">
                <p>Relatório emitido automaticamente pelo aplicativo Horta Fácil</p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Gera PDF a partir do HTML
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });

      // Compartilha o PDF
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Cronograma de Cultivos',
        UTI: 'com.adobe.pdf',
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
            {status}
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
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.headerLogo}
          />
          <View style={styles.headerText}>
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
  headerLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginRight: 16,
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
    marginTop: 2,
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
