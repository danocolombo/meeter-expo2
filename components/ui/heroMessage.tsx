import theme from '@assets/Colors'; // Import the default export
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HeroMessageProps {
    message: string;
}

const HeroMessage: React.FC<HeroMessageProps> = ({ message }) => (
    <View style={styles.heroContainer}>
        <Text style={styles.heroText}>{message}</Text>
    </View>
);

const styles = StyleSheet.create({
    heroContainer: {
        backgroundColor: theme.colors.primaryBackground,
        borderRadius: 15,
        padding: 16,
        marginBottom: 16,
        marginHorizontal: 16,
        alignSelf: 'stretch',
        alignItems: 'center',
    },
    heroText: {
        color: theme.colors.lightText,
        fontSize: 20,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default HeroMessage;
