import { printObject } from '@utils/helpers';
import { RootState } from '@utils/store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Button,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import useAuth from '../(hooks)/useAuth';
import SigninLayout from './signin-layout';

export default function Signin() {
    const { handleLoginUser } = useAuth();
    const [login, setLogin] = useState('');
    const user = useSelector((state: RootState) => state.user);
    const [password, setPassword] = useState('');
    const router = useRouter();

    React.useEffect(() => {
        if (user && user.isAuthenticated) {
            router.replace('/(drawer)');
        }
    }, [user, router]);

    const handleLoginPress = async () => {
        await handleLoginUser(login, password);
    };

    React.useEffect(() => {
        printObject('signin.tsx:33 user after login:\n', user);
    }, [user]);

    const handleRegister = () => {
        console.log('please register me');
    };
    printObject('signin.tsx:39 user:\n', user);
    return (
        <SigninLayout>
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
                <Button title='Login' onPress={handleLoginPress} />
                <TouchableOpacity
                    onPress={handleRegister}
                    style={styles.registerLink}
                >
                    <Text style={styles.registerText}>Register</Text>
                </TouchableOpacity>
            </View>
        </SigninLayout>
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
