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
import { fetchCultivosDetalhados, fetchCalendario } from '../services/api';

const HortaDetalheScreen = ({ route, navigation }) => {
  const { horta } = route.params;
  const [cultivos, setCultivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCalendario, setLoadingCalendario] = useState(false);
  const [calendario, setCalendario] = useState(null);
  const [showCalendarioModal, setShowCalendarioModal] = useState(false);

  useEffect(() => {
    loadCultivos();
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

  const renderCultivoItem = ({ item }) => {
    const { cultivo, hortalica } = item;
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('HortalicaDetalhe', { cultivoDetalhado: item })
        }
      >
        <View style={styles.cardContent}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{hortalica.nome}</Text>
            <Text style={styles.cardSubtitle}>
              Módulos: {cultivo.num_modulos} | Início: {cultivo.data_inicio}
            </Text>
            <Text style={styles.cardDetail}>
              Produção: {cultivo.producao_semanal_desejada} /semana
            </Text>
          </View>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => handleGerarCalendario(cultivo.id)}
            disabled={loadingCalendario}
          >
            {loadingCalendario ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <Text style={styles.calendarIcon}>📅</Text>
            )}
          </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{horta.nome}</Text>
        {horta.localizacao && (
          <Text style={styles.headerSubtitle}>{horta.localizacao}</Text>
        )}
        {horta.area_total && (
          <Text style={styles.headerSubtitle}>Área: {horta.area_total} m²</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Cultivos:</Text>

      <FlatList
        data={cultivos}
        renderItem={renderCultivoItem}
        keyExtractor={(item) => item.cultivo.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum cultivo cadastrado para esta horta.
            </Text>
          </View>
        }
      />

      {/* Modal do Calendário */}
      <Modal
        visible={showCalendarioModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCalendarioModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Calendário de Atividades</Text>
            <ScrollView style={styles.modalScroll}>
              {calendario?.map((atividade, index) => (
                <View key={index} style={styles.atividadeCard}>
                  <Text style={styles.atividadeTitle}>
                    Módulo {atividade.modulo}
                  </Text>
                  <Text style={styles.atividadeText}>
                    Plantio: {atividade.data_plantio}
                  </Text>
                  <Text style={styles.atividadeText}>
                    Início Colheita: {atividade.data_inicio_colheita}
                  </Text>
                  <Text style={styles.atividadeText}>
                    Fim Colheita: {atividade.data_fim_colheita}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCalendarioModal(false)}
            >
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#34495E',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardDetail: {
    fontSize: 12,
    color: '#999',
  },
  calendarButton: {
    padding: 8,
    marginLeft: 8,
  },
  calendarIcon: {
    fontSize: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  atividadeCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  atividadeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  atividadeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalCloseButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HortaDetalheScreen;
