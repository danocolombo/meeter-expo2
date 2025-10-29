import theme from '@assets/Colors';
import { Stack, useRouter } from 'expo-router';
import { Text, TouchableOpacity, useColorScheme } from 'react-native';

export default function EditLayout() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const cancelColor =
        colorScheme === 'dark'
            ? theme.colors.navigateTextLight
            : theme.colors.navigateTextDark;
    return (
        <Stack>
            <Stack.Screen
                name='[id]'
                options={({ route }) => {
                    const params = (route && (route as any).params) || {};
                    const meetingId =
                        params?.meetingId ||
                        params?.fromMeetingId ||
                        params?.id;
                    const origin = params?.origin;
                    const org_id = params?.org_id;
                    return {
                        title: 'Edit Group',
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ marginLeft: 16 }}
                                onPress={() => {
                                        try {
                                            const navParams: any = {};
                                            if (meetingId) navParams.id = meetingId;
                                            if (origin) navParams.origin = origin;
                                            if (org_id) navParams.org_id = org_id;
                                            if ((route as any)?.params?.meeting)
                                                navParams.meeting = (
                                                    route as any
                                                ).params.meeting;

                                            const nav: any = {
                                                pathname: '/(meeting)/[id]',
                                                params: navParams,
                                            };

                                            try {
                                                if ((router as any).replace) {
                                                    (router as any).replace(nav as any);
                                                } else {
                                                    (router as any).push(nav as any);
                                                }
                                            } catch {
                                                // ignore and try back fallback
                                            }

                                            // After navigation attempt, ensure any lingering
                                            // edit route is popped so the details screen is active.
                                            setTimeout(() => {
                                                try {
                                                    (router as any).back?.();
                                                } catch {
                                                    // ignore
                                                }
                                            }, 50);
                                        } catch {
                                            router.back?.();
                                        }
                                    }}
                            >
                                <Text
                                    style={{
                                        color: cancelColor,
                                        fontSize: 16,
                                    }}
                                    selectable={false}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        ),
                    };
                }}
            />
        </Stack>
    );
}
