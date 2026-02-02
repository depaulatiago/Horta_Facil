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
  SectionList,
  Dimensions,
  Image,
  Linking,
} from 'react-native';
import MaterialIcon from '@expo/vector-icons/MaterialIcons';
import { fetchCalendarioConsolidado, gerarPDFSemanal, API_BASE_URL } from '../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const CalendarioScreen = ({ navigation }) => {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todas'); // 'todas', 'plantio', 'colheita'

  const loadCalendario = async () => {
    try {
      setError(null);
      const data = await fetchCalendarioConsolidado();
      setAtividades(data);
    } catch (err) {
      setError(err.message);
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCalendario();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCalendario();
  };

  const handleGerarPDF = async () => {
    setLoading(true);
    try {
      const pdfUrl = await gerarPDFSemanal();

      // Baixar o PDF direto para o cache
      const filename = `cronograma_${new Date().getTime()}.pdf`;
      const fileUri = FileSystem.cacheDirectory + filename;

      const { uri } = await FileSystem.downloadAsync(pdfUrl, fileUri);

      // Compartilhar arquivo
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Cronograma Semanal',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const agruparPorData = (atividades) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const grupos = {
      'Hoje': [],
      'Próximos 7 dias': [],
      'Próximos 30 dias': [],
      'Depois': [],
      'Vencidas': [],
    };

    atividades.forEach((atividade) => {
      const dataTarefa = new Date(atividade.data_plantio);
      dataTarefa.setHours(0, 0, 0, 0);

      const diasDiferenca = Math.floor((dataTarefa - hoje) / (1000 * 60 * 60 * 24));

      if (diasDiferenca < 0) {
        grupos['Vencidas'].push(atividade);
      } else if (diasDiferenca === 0) {
        grupos['Hoje'].push(atividade);
      } else if (diasDiferenca > 0 && diasDiferenca <= 7) {
        grupos['Próximos 7 dias'].push(atividade);
      } else if (diasDiferenca > 7 && diasDiferenca <= 30) {
        grupos['Próximos 30 dias'].push(atividade);
      } else if (diasDiferenca > 30) {
        grupos['Depois'].push(atividade);
      }
    });

    return Object.entries(grupos)
      .filter(([_, items]) => items.length > 0)
      .map(([titulo, data]) => ({
        title: titulo,
        data: data,
      }));
  };

  const obterTipoAtividade = (atividade) => {
    if (atividade.data_plantio) return 'plantio';
    if (atividade.data_inicio_colheita) return 'colheita';
    return 'outro';
  };

  const obterIconeAtividade = (tipo) => {
    switch (tipo) {
      case 'plantio':
        return 'eco';
      case 'colheita':
        return 'local-florist';
      default:
        return 'calendar-today';
    }
  };

  const obterTextoAtividade = (tipo) => {
    switch (tipo) {
      case 'plantio':
        return 'Plantio';
      case 'colheita':
        return 'Colheita';
      default:
        return 'Outro';
    }
  };

  const filtrarAtividades = (atividades) => {
    if (filtroTipo === 'todas') {
      return atividades;
    }
    return atividades.filter((a) => obterTipoAtividade(a) === filtroTipo);
  };

  const renderAtividadeItem = ({ item, section }) => {
    const tipo = obterTipoAtividade(item);
    const iconName = obterIconeAtividade(tipo);
    const data = new Date(item.data_plantio).toLocaleDateString('pt-BR');

    return (
      <View style={styles.atividadeCard}>
        <View style={styles.atividadeIcon}>
          <MaterialIcon name={iconName} size={20} color="#27AE60" />
        </View>
        <View style={styles.atividadeConteudo}>
          <Text style={styles.atividadeTipo}>
            {obterTextoAtividade(tipo)} - Módulo {item.modulo}
          </Text>
          <Text style={styles.atividadeHortaliça}>{item.hortalica_nome}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcon name="home" size={12} color="#666" />
            <Text style={styles.atividadeHorta}> {item.horta_nome}</Text>
          </View>
          <Text style={styles.atividadeData}>{data}</Text>
        </View>
        <TouchableOpacity style={styles.atividadeBotao}>
          <Text style={styles.atividadeBotaoTexto}>→</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>
        <MaterialIcon name={title === 'Vencidas' ? 'schedule' : title === 'Hoje' ? 'my-location' : title === 'Próximos 7 dias' ? 'schedule' : title === 'Próximos 30 dias' ? 'calendar-today' : 'auto-awesome'} size={14} color="#999" />
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando cronograma...</Text>
      </View>
    );
  }

  if (error && atividades.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>
          <MaterialIcon name="warning" size={48} color="#E74C3C" />
        </Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCalendario}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const atividadesFiltradas = filtrarAtividades(atividades);
  const secoes = agruparPorData(atividadesFiltradas);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.headerLogo}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerSubtitle}>Minhas Tarefas</Text>
            <Text style={styles.headerTitle}>Cronograma</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.pdfButton}
          onPress={handleGerarPDF}
          disabled={loading}
        >
          <Text style={styles.pdfButtonText}>
            <MaterialIcon name="picture-as-pdf" size={14} color="#FFF" /> Gerar PDF Semanal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[
            styles.filtroButton,
            filtroTipo === 'todas' && styles.filtroButtonAtivo,
          ]}
          onPress={() => setFiltroTipo('todas')}
        >
          <Text
            style={[
              styles.filtroTexto,
              filtroTipo === 'todas' && styles.filtroTextoAtivo,
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroButton,
            filtroTipo === 'plantio' && styles.filtroButtonAtivo,
          ]}
          onPress={() => setFiltroTipo('plantio')}
        >
          <Text
            style={[
              styles.filtroTexto,
              filtroTipo === 'plantio' && styles.filtroTextoAtivo,
            ]}
          >
            <MaterialIcon name="eco" size={14} color={filtroTipo === 'plantio' ? '#27AE60' : '#666'} /> Plantio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroButton,
            filtroTipo === 'colheita' && styles.filtroButtonAtivo,
          ]}
          onPress={() => setFiltroTipo('colheita')}
        >
          <Text
            style={[
              styles.filtroTexto,
              filtroTipo === 'colheita' && styles.filtroTextoAtivo,
            ]}
          >
            🌾 Colheita
          </Text>
        </TouchableOpacity>
      </View>

      {secoes.length > 0 ? (
        <SectionList
          sections={secoes}
          keyExtractor={(item, index) => `cultivo_${item.cultivo_id}_modulo_${item.modulo}_${index}`}
          renderItem={renderAtividadeItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          scrollIndicatorInsets={{ right: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
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
  },
  filtrosContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtroButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filtroButtonAtivo: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filtroTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filtroTextoAtivo: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  sectionCount: {
    fontSize: 18,
  },
  atividadeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  atividadeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  atividadeIconText: {
    fontSize: 24,
  },
  atividadeConteudo: {
    flex: 1,
  },
  atividadeTipo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  atividadeHortaliça: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  atividadeHorta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  atividadeData: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  atividadeBotao: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  atividadeBotaoTexto: {
    fontSize: 18,
    color: '#4CAF50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
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
  pdfButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    marginHorizontal: 20,
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
});

export default CalendarioScreen;
