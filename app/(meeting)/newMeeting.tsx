import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NewMeeting = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    if (id) {
                        router.push({
                            pathname: '/(meeting)/[id]',
                            params: { id },
                        });
                    } else {
                        router.back();
                    }
                }}
            >
                <Text style={styles.backText}>{'< Back'}</Text>
            </TouchableOpacity>
            <Text style={styles.title}>New Meeting</Text>
        </View>
    );
};

export default NewMeeting;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 48,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 48,
        padding: 8,
    },
    backText: {
        color: '#007AFF',
        fontSize: 16,
    },
    title: {
        marginTop: 80,
        fontSize: 24,
        fontWeight: 'bold',
    },
});
