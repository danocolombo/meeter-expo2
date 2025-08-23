import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
const Layout = () => {
    const router = useRouter();
    return (
        <Stack>
            <Stack.Screen
                name='index'
                options={{
                    headerLeft: () => (
                        <View style={{ marginLeft: -16 }}>
                            <DrawerToggleButton tintColor='#000' />
                        </View>
                    ),
                    headerRight: () => (
                        <View style={{ marginRight: 16 }}>
                            <TouchableOpacity
                                onPress={() =>
                                    router.push(
                                        '/(drawer)/profile/profile-edit'
                                    )
                                }
                            >
                                <View>
                                    <Text>EDIT</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <Stack.Screen
                name='profile-edit'
                options={{
                    title: 'EDIT',
                    headerBackTitle: 'Back',
                    headerTintColor: '#000',
                }}
            />
        </Stack>
    );
};
export default Layout;
