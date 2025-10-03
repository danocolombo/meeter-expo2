import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
    children: React.ReactNode;
};

export default function LoginLayout({ children }: Props) {
    return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
});
