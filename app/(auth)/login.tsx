import React, { useState } from 'react';
import {
    Button,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import LoginLayout from './login-layout';

export default function Login() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        console.log('Login:', login);
        console.log('Password:', password);
    };

    const handleRegister = () => {
        console.log('please register me');
    };

    return (
        <LoginLayout>
            <View style={styles.form}>
                <Text style={styles.title}>Login</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Login'
                    value={login}
                    onChangeText={setLogin}
                    autoCapitalize='none'
                />
                <TextInput
                    style={styles.input}
                    placeholder='Password'
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <Button title='Login' onPress={handleLogin} />
                <TouchableOpacity
                    onPress={handleRegister}
                    style={styles.registerLink}
                >
                    <Text style={styles.registerText}>Register</Text>
                </TouchableOpacity>
            </View>
        </LoginLayout>
    );
}

const styles = StyleSheet.create({
    form: {
        gap: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        fontSize: 16,
    },
    registerLink: {
        marginTop: 24,
        alignItems: 'center',
    },
    registerText: {
        color: '#007AFF',
        fontSize: 16,
    },
});
