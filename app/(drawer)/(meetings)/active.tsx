import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ActiveMeetings = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>ActiveMeetings</Text>

            <TouchableOpacity
                style={styles.link}
                onPress={() =>
                    router.push({
                        pathname: '/(meeting)/[id]',
                        params: { id: '100', from: 'active' },
                    })
                }
            >
                <Text style={styles.linkText}>Meeting 100</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.link}
                onPress={() =>
                    router.push({
                        pathname: '/(meeting)/[id]',
                        params: { id: '101', from: 'active' },
                    })
                }
            >
                <Text style={styles.linkText}>Meeting 101</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ActiveMeetings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 48,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    link: {
        marginTop: 24,
        padding: 12,
        backgroundColor: '#F2A310',
        borderRadius: 8,
    },
    linkText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
