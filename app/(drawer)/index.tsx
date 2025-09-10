import { getAffiliations } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Landing = () => {
    const { data: affiliations } = useQuery({
        queryKey: ['affiliations'],
        queryFn: getAffiliations,
    });
    console.log('AFFILIATIONS:\n', affiliations);
    return (
        <View style={styles.container}>
            <Text>Landing</Text>
        </View>
    );
};

export default Landing;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
