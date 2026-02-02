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
  Modal,
  FlatList,
} from 'react-native';
import MaterialIcon from '@expo/vector-icons/MaterialIcons';
import { fetchHortalicas, createCultivo, calcularDimensionamento } from '../services/api';

const AddHortalicaScreen = ({ route, navigation }) => {
  const { horta } = route.params;
  
  const [hortalicas, setHortalicas] = useState([]);
  const [selectedHortalicaId, setSelectedHortalicaId] = useState(null);
  const [selectedHortalicaNome, setSelectedHortalicaNome] = useState('');
  const [numModulos, setNumModulos] = useState('1');
  const [producaoSemanal, setProducaoSemanal] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculoLoading, setCalculoLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadHortalicas();
  }, []);

  const loadHortalicas = async () => {
    try {
      const data = await fetchHortalicas();
      console.log('Hortaliças carregadas:', data);
      setHortalicas(data);
      if (data.length > 0) {
        setSelectedHortalicaId(data[0].id);
        setSelectedHortalicaNome(data[0].nome);
      } else {
        Alert.alert('Aviso', 'Nenhuma hortaliça disponível no sistema.');
      }
    } catch (error) {
      console.error('Erro ao carregar hortaliças:', error);
      Alert.alert('Erro', error.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHortalica = (id, nome) => {
    setSelectedHortalicaId(id);
    setSelectedHortalicaNome(nome);
    setModalVisible(false);
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
      console.log('Resultado do cálculo:', resultado);
      setNumModulos(resultado.num_modulos_calculado?.toString() || '1');
      Alert.alert(
        'Cálculo Realizado',
        `Módulos necessários: ${resultado.num_modulos_calculado}\nÁrea total: ${resultado.area_total_calculada} m²`
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
      Alert.alert('Atenção', 'Selecione uma data de início.');
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

  const renderHortalicaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelectHortalica(item.id, item.nome)}
    >
      <View style={styles.modalItemContent}>
        <Text style={styles.modalItemText}>{item.nome}</Text>
        {selectedHortalicaId === item.id && (
          <Text style={styles.modalItemCheck}>✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setDataInicio(formatDate(newDate));
    setDatePickerVisible(false);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty_${i}`} style={styles.calendarDayEmpty} />
      );
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate.toDateString() === date.toDateString();
      
      days.push(
        <TouchableOpacity
          key={`day_${day}`}
          style={[
            styles.calendarDay,
            isSelected && styles.calendarDaySelected,
          ]}
          onPress={() => handleDateSelect(day)}
        >
          <Text style={[
            styles.calendarDayText,
            isSelected && styles.calendarDayTextSelected,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
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
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.selectorText}>
              {selectedHortalicaNome || 'Toque para selecionar'}
            </Text>
            <Text style={styles.selectorArrow}>›</Text>
          </TouchableOpacity>

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

          <Text style={styles.label}>Data de Início *</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text style={styles.selectorText}>
              {dataInicio || 'Toque para selecionar data'}
            </Text>
            <MaterialIcon name="calendar-today" size={20} color="#27AE60" />
          </TouchableOpacity>
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

      {/* Modal de Seleção de Hortaliça */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha uma Hortaliça</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={hortalicas}
              renderItem={renderHortalicaItem}
              keyExtractor={(item) => `hortalica_${item.id}`}
              scrollIndicatorInsets={{ right: 1 }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal do Calendário */}
      <Modal
        visible={datePickerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContent}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={handlePreviousMonth}>
                <Text style={styles.datePickerArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerMonth}>
                {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={handleNextMonth}>
                <Text style={styles.datePickerArrow}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekdays}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                <Text key={day} style={styles.calendarWeekday}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarDays}>
              {renderCalendar()}
            </View>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setDatePickerVisible(false)}
            >
              <Text style={styles.datePickerButtonText}>Pronto</Text>
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
  selectorButton: {
    backgroundColor: '#F0F9F7',
    borderWidth: 1.5,
    borderColor: '#AECDC1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectorText: {
    fontSize: 15,
    color: '#1B4D3E',
    fontWeight: '500',
  },
  selectorArrow: {
    fontSize: 24,
    color: '#27AE60',
    fontWeight: 'bold',
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
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    padding: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#AECDC1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1B4D3E',
    fontWeight: '500',
  },
  modalItemCheck: {
    fontSize: 20,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#AECDC1',
  },
  datePickerMonth: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B4D3E',
    textTransform: 'capitalize',
  },
  datePickerArrow: {
    fontSize: 28,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  calendarWeekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#52796F',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 4,
  },
  calendarDaySelected: {
    backgroundColor: '#27AE60',
  },
  calendarDayEmpty: {
    width: '14.28%',
    aspectRatio: 1,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4D3E',
  },
  calendarDayTextSelected: {
    color: '#fff',
  },
  datePickerButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default AddHortalicaScreen;
