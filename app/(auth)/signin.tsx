import { RootState } from '@utils/store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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
    const user: any = useSelector((state: RootState) => state.user);
    const [password, setPassword] = useState('');
    const router = useRouter();

    React.useEffect(() => {
        if (user && user.isAuthenticated) {
            router.replace('/(drawer)');
        }
    }, [user, router]);

    const handleLoginPress = async () => {
        // If mock login is enabled via env, inject the mock values
        const mockEnabled =
            typeof process !== 'undefined' &&
            (process.env?.EXPO_PUBLIC_MOCK_LOGIN === 'true' ||
                process.env?.EXPO_PUBLIC_MOCK_LOGIN === '1');

        if (mockEnabled) {
            const mockUsername =
                process.env?.EXPO_PUBLIC_MOCK_USERNAME || login;
            const mockEmail = process.env?.EXPO_PUBLIC_MOCK_EMAIL || '';
            const mockSub = process.env?.EXPO_PUBLIC_MOCK_SUB || '';

            // expose what we're injecting (keeps variables used to avoid lint errors)
            // These values are also consumed by the auth hook which reads the same env vars.
            console.debug('Mock login injection:', {
                mockUsername,
                mockEmail,
                mockSub,
            });

            // update the local input so the UI reflects the injected mock username
            setLogin(mockUsername);

            // call the auth handler with the mock username. The auth hook
            // will pick up other mock values (email, sub, etc.) from env as needed.
            await handleLoginUser(mockUsername, password);
            return;
        }

        await handleLoginUser(login, password);
    };

    const handleRegister = () => {
        console.log('please register me');
    };
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
                    editable={!user.isLoading}
                />
                <TextInput
                    style={styles.input}
                    placeholder='Password'
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!user.isLoading}
                />
                {user.isLoading ? (
                    <ActivityIndicator
                        size='large'
                        color='#007AFF'
                        style={{ marginVertical: 12 }}
                    />
                ) : (
                    <Button
                        title='Login'
                        onPress={handleLoginPress}
                        disabled={user.isLoading}
                    />
                )}
                <TouchableOpacity
                    onPress={handleRegister}
                    style={styles.registerLink}
                    disabled={user.isLoading}
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
