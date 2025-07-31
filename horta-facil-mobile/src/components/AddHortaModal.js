// /src/components/AddHortaModal.js
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const AddHortaModal = ({ visible, onClose, onSave }) => {
    const [nomeHorta, setNomeHorta] = useState('');

    const handleSave = () => {
        if (nomeHorta.trim()) { // Só salva se o nome não estiver em branco
            onSave({ nome: nomeHorta });
            setNomeHorta(''); // Limpa o campo após salvar
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Nova Horta</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nome da sua horta (ex: Horta da Varanda)"
                        value={nomeHorta}
                        onChangeText={setNomeHorta}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={onClose}>
                            <Text style={styles.textStyleCancel}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={handleSave}>
                            <Text style={styles.textStyleSave}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fundo escurecido
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        elevation: 5,
    },
    modalTitle: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        borderRadius: 10,
        padding: 12,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
    },
    buttonCancel: {
        backgroundColor: '#f0f0f0',
    },
    buttonSave: {
        backgroundColor: '#76C893', // Verde
    },
    textStyleCancel: {
        color: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textStyleSave: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default AddHortaModal;