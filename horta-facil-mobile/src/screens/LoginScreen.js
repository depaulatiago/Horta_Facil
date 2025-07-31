// /src/screens/LoginScreen.js

import React, { useState } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity, 
    SafeAreaView,
    KeyboardAvoidingView,
    Platform 
} from 'react-native';

const COLORS = {
    background: '#F4FBF0',
    primary: '#76C893',
    text: '#1D3557',
    inputBackground: '#FFFFFF',
    inputBorder: '#E8E8E8'
};

// 1. A tela agora recebe "navigation" como um parâmetro (prop)
const LoginScreen = ({ navigation }) => {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');

    // 2. Criamos uma função para lidar com o login
    const handleLogin = () => {
        // No futuro, aqui você valida o login.
        // Por agora, apenas navegamos para a tela principal do app.
        // 'MainApp' é o nome que demos para o nosso conjunto de telas com menu no App.js
        // Usamos .replace() para que o usuário não consiga usar o botão "voltar" do celular para a tela de login.
        navigation.replace('MainApp');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>HORTA FÁCIL</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Usuário ou E-mail"
                        placeholderTextColor="#999"
                        value={usuario}
                        onChangeText={setUsuario}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Senha"
                        placeholderTextColor="#999"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry={true}
                    />

                    {/* 3. O botão agora chama a função handleLogin quando pressionado */}
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>ENTRAR</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        width: '85%',
        alignItems: 'center',
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 40,
    },
    input: {
        width: '100%',
        height: 55,
        backgroundColor: COLORS.inputBackground,
        borderRadius: 15,
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
    },
    loginButton: {
        width: '100%',
        height: 55,
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LoginScreen;