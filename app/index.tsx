import { getPersonBySub } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';

const sub = process.env.EXPO_PUBLIC_USER_COGNITO_SUB;

export default function Index() {
    const router = useRouter();
    const { data: person, isLoading } = useQuery({
        queryKey: ['person'],
        queryFn: () => getPersonBySub(sub || ''),
        enabled: !!sub && sub.trim() !== '',
    });

    useEffect(() => {
        if (!sub || sub.trim() === '') {
            // Do nothing, error will be shown below
            return;
        }
        if (person && person.sub) {
            console.log('########################################');
            console.log('PERSON BY SUB:\n', person);
            console.log('Welcome ', person?.first_name);
            console.log('########################################');
            router.replace('/(drawer)');
        } else if (person && !person.sub) {
            router.replace('/profile-edit');
        }
    }, [person, sub, router]);

    if (!sub || sub.trim() === '') {
        return (
            <>
                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginBottom: 8,
                    }}
                >
                    Error: User SUB is not set in environment variables.
                </Text>
                <Text>Please check your .env configuration.</Text>
            </>
        );
    }

    // Optionally show loading or nothing while redirecting
    if (isLoading || !person) {
        return <Text>Loading...</Text>;
    }

    // No UI needed, redirect handled in useEffect
    return null;
}
