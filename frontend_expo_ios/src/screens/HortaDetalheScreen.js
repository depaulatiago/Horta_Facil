// src/screens/HortaDetalheScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import MaterialIcon from '@expo/vector-icons/MaterialIcons';
import { fetchCultivosDetalhados, fetchCalendario, deleteHorta, deleteCultivo } from '../services/api';

const HortaDetalheScreen = ({ route, navigation }) => {
  const { horta } = route?.params || {};
  
  const [cultivos, setCultivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCalendario, setLoadingCalendario] = useState(false);
  const [calendario, setCalendario] = useState(null);
  const [showCalendarioModal, setShowCalendarioModal] = useState(false);

  useEffect(() => {
    if (horta?.id) {
      loadCultivos();
    } else {
      setLoading(false);
    }
  }, []);

  const loadCultivos = async () => {
    try {
      const data = await fetchCultivosDetalhados(horta.id);
      setCultivos(data);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGerarCalendario = async (cultivoId) => {
    setLoadingCalendario(true);
    try {
      const data = await fetchCalendario(cultivoId);
      setCalendario(data);
      setShowCalendarioModal(true);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoadingCalendario(false);
    }
  };

  const handleExcluirHorta = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a horta "${horta.nome}"? Esta ação não pode ser desfeita e todos os cultivos desta horta serão perdidos.`,
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
              await deleteHorta(horta.id);
              Alert.alert('Sucesso', 'Horta excluída com sucesso');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', error.message);
            }
          },
        },
      ]
    );
  };

  const handleExcluirCultivo = (cultivoId, hortalicaNome) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o cultivo de "${hortalicaNome}"? Esta ação não pode ser desfeita.`,
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
              await deleteCultivo(cultivoId);
              Alert.alert('Sucesso', 'Cultivo excluído com sucesso');
              loadCultivos();
            } catch (error) {
              Alert.alert('Erro', error.message);
            }
          },
        },
      ]
    );
  };

  const renderCultivoItem = ({ item }) => {
    const { cultivo, hortalica } = item;
    
    // Validação para evitar erro se hortalica for undefined
    if (!hortalica || !cultivo) {
      return null;
    }
    
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('HortalicaDetalhe', { cultivoDetalhado: item })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <MaterialIcon name="leaf" size={32} color="#27AE60" />
          </View>
          <View style={styles.cardTitleSection}>
            <Text style={styles.cardTitle}>{hortalica.nome}</Text>
            <Text style={styles.cardSubtitle}>
              <MaterialIcon name="calendar-today" size={14} color="#666" /> Início: {cultivo.data_inicio}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => handleGerarCalendario(cultivo.id)}
            disabled={loadingCalendario}
          >
            {loadingCalendario ? (
              <ActivityIndicator size="small" color="#27AE60" />
            ) : (
              <MaterialIcon name="calendar-month" size={20} color="#27AE60" />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Módulos</Text>
            <Text style={styles.detailValue}>{cultivo.num_modulos}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Produção</Text>
            <Text style={styles.detailValue}>{cultivo.producao_semanal_desejada} kg</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!horta) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcon name="warning" size={48} color="#E74C3C" />
        <Text style={styles.errorText}>Horta não encontrada</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>‹ Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExcluirHorta} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>
              <MaterialIcon name="delete" size={16} color="#E74C3C" /> Excluir
            </Text>
          </TouchableOpacity>
        </View>
          <Text style={styles.headerTitle}>
            <MaterialIcon name="spa" size={24} color="#27AE60" /> {horta.nome}
          </Text>
        {horta.localizacao && (
          <Text style={styles.headerSubtitle}>
            <MaterialIcon name="location-on" size={14} color="#999" /> {horta.localizacao}
          </Text>
        )}
        {horta.area_total && (
          <Text style={styles.headerSubtitle}>
            <MaterialIcon name="square-foot" size={14} color="#999" /> Área: {horta.area_total} m²
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Seus Cultivos</Text>

      <FlatList
        data={cultivos}
        renderItem={renderCultivoItem}
        keyExtractor={(item) => item.cultivo.id.toString()}
        contentContainerStyle={styles.listContent}
        scrollIndicatorInsets={{ right: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcon name="eco" size={48} color="#CCC" />
            <Text style={styles.emptyText}>
              Nenhum cultivo cadastrado
            </Text>
            <Text style={styles.emptySubtext}>
              Toque no + para adicionar sua primeira hortaliça
            </Text>
          </View>
        }
      />

      {/* Botão Flutuante para Adicionar Hortaliça */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddHortalica', { horta })}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal do Calendário */}
      <Modal
        visible={showCalendarioModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCalendarioModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                <MaterialIcon name="calendar-today" size={18} color="#333" /> Calendário
              </Text>
              <TouchableOpacity onPress={() => setShowCalendarioModal(false)}>
                <MaterialIcon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {calendario?.map((atividade, index) => (
                <View key={index} style={styles.atividadeCard}>
                  <View style={styles.atividadeHeader}>
                    <Text style={styles.atividadeTitle}>
                      <MaterialIcon name="dashboard" size={16} color="#666" /> Módulo {atividade.modulo}
                    </Text>
                  </View>
                  <View style={styles.atividadeLine}>
                    <Text style={styles.atividadeLabel}>
                      <MaterialIcon name="eco" size={14} color="#27AE60" /> Plantio:
                    </Text>
                    <Text style={styles.atividadeValue}>{atividade.data_plantio}</Text>
                  </View>
                  <View style={styles.atividadeLine}>
                    <Text style={styles.atividadeLabel}>
                      <MaterialIcon name="local-florist" size={14} color="#27AE60" /> Início Colheita:
                    </Text>
                    <Text style={styles.atividadeValue}>{atividade.data_inicio_colheita}</Text>
                  </View>
                  <View style={styles.atividadeLine}>
                    <Text style={styles.atividadeLabel}>
                      <MaterialIcon name="done" size={14} color="#27AE60" /> Fim Colheita:
                    </Text>
                    <Text style={styles.atividadeValue}>{atividade.data_fim_colheita}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    flex: 1,
  },
  backText: {
    color: '#E8F8F5',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
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
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F8F5',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B4D3E',
    paddingHorizontal: 16,
    paddingVertical: 16,
    letterSpacing: 0.3,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F9F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardTitleSection: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#52796F',
    fontWeight: '500',
  },
  calendarButton: {
    padding: 8,
    marginLeft: 8,
  },
  calendarIcon: {
    fontSize: 24,
  },
  cardDetails: {
    flexDirection: 'row',
    backgroundColor: '#F0F9F7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#52796F',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#27AE60',
  },
  detailDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#AECDC1',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#52796F',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '90%',
    paddingHorizontal: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F9F7',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B4D3E',
    letterSpacing: 0.3,
  },
  modalClose: {
    fontSize: 24,
    color: '#52796F',
    fontWeight: '600',
  },
  modalScroll: {
    maxHeight: 400,
    paddingHorizontal: 16,
  },
  atividadeCard: {
    backgroundColor: '#F0F9F7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#27AE60',
  },
  atividadeHeader: {
    marginBottom: 10,
  },
  atividadeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B4D3E',
    letterSpacing: 0.3,
  },
  atividadeLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  atividadeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#52796F',
  },
  atividadeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#27AE60',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#27AE60',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 36,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HortaDetalheScreen;
