import { Slot, useNavigation, useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function MeetingsLayout() {
    const router = useRouter();
    const segments = useSegments();
    const navigation = useNavigation();

    // Only show New button on active or historic screens
    const showNew =
        segments[segments.length - 1] === 'active' ||
        segments[segments.length - 1] === 'historic';

    const handleNew = useCallback(() => {
        router.push({
            pathname: '/(meeting)/newMeeting',
            params: { from: segments[segments.length - 1] },
        });
    }, [router, segments]);

    useEffect(() => {
        if (showNew) {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity
                        onPress={handleNew}
                        style={{ marginRight: 16 }}
                    >
                        <Text
                            style={{
                                color: '#007AFF',
                                fontWeight: 'bold',
                                fontSize: 16,
                            }}
                        >
                            New
                        </Text>
                    </TouchableOpacity>
                ),
            });
        } else {
            navigation.setOptions({ headerRight: undefined });
        }
    }, [showNew, handleNew, navigation]);

    return <Slot />;
}
