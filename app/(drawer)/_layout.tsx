import theme from '@assets/Colors';
import {
    DrawerContentScrollView,
    useDrawerStatus,
} from '@react-navigation/drawer';
import { usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect } from 'react';
import {
    Image,
    ImageBackground,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const CustomDrawerContent = (props: any) => {
    const router = useRouter();
    const user = useSelector((state: any) => state.user);
    const { bottom } = useSafeAreaInsets();
    const isDrawerOpen = useDrawerStatus() === 'open';
    const pathName = usePathname();

    useEffect(() => {
        if (!user?.isAuthenticated) {
            router.replace('/(auth)/signin');
        }
    }, [user, router]);

    useEffect(() => {
        // if (isDrawerOpen) {
        //     loadLocations();
        // }
    }, [isDrawerOpen]);

    return (
        <ImageBackground
            source={require('@assets/images/menu-bg.jpeg')}
            style={{ flex: 1, width: '100%', height: '100%' }}
            resizeMode='cover'
        >
            <View style={{ flex: 1 }}>
                <DrawerContentScrollView>
                    <View style={{ alignItems: 'center', marginVertical: 12 }}>
                        <TouchableOpacity
                            onPress={() => router.navigate('/(drawer)')}
                        >
                            <Image
                                source={require('@assets/images/icon.png')}
                                style={{
                                    width: 50,
                                    height: 50,
                                    resizeMode: 'cover',
                                    borderRadius: 25,
                                    borderWidth: 2,
                                    borderColor: '#fff',
                                }}
                                accessibilityLabel='Meeter Logo'
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.menuSectionHeader}>
                        <Text
                            style={{
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: 16,
                            }}
                        >
                            Meetings
                        </Text>
                    </View>
                    <View style={styles.menuIndentedItem}>
                        <TouchableOpacity
                            key={'activeMeetings'}
                            onPress={() =>
                                router.navigate(`/(drawer)/(meetings)/active`)
                            }
                            style={{
                                paddingVertical: 0,
                                marginVertical: 0,
                                minHeight: 0,
                                justifyContent: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    padding: 0,
                                    margin: 0,
                                    color:
                                        pathName ===
                                        `/(drawer)/(meetings)/active`
                                            ? '#F2A310'
                                            : '#fff',
                                    fontWeight:
                                        pathName ===
                                        `/(drawer)/(meetings)/active`
                                            ? 'bold'
                                            : 'normal',
                                }}
                            >
                                Active
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            key={'historicMeetings'}
                            onPress={() =>
                                router.navigate(`/(drawer)/(meetings)/historic`)
                            }
                            style={{
                                paddingVertical: 0,
                                marginVertical: 0,
                                minHeight: 0,
                                justifyContent: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    padding: 0,
                                    margin: 0,
                                    color:
                                        pathName ===
                                        `/(drawer)/(meetings)/historic`
                                            ? '#F2A310'
                                            : '#fff',
                                    fontWeight:
                                        pathName ===
                                        `/(drawer)/(meetings)/historic`
                                            ? 'bold'
                                            : 'normal',
                                }}
                            >
                                Historic
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* <View style={styles.locationsContainer}>
                        <DrawerItemList {...props} />
                    </View> */}
                </DrawerContentScrollView>
                <View
                    style={{
                        paddingBottom: 20 + bottom,
                        borderTopWidth: 1,
                        borderTopColor: '#dde3fe',
                        padding: 16,
                    }}
                >
                    <Text style={{ color: theme.colors.menuText }}>
                        Copyright Fortson Guru 2025
                    </Text>
                </View>
            </View>
        </ImageBackground>
    );
};

export default function Layout() {
    return (
        <GestureHandlerRootView>
            <Drawer
                drawerContent={CustomDrawerContent}
                screenOptions={{
                    drawerHideStatusBarOnOpen: true,
                    drawerActiveTintColor: '#F2A310',
                    headerTintColor: '#000',
                }}
            >
                <Drawer.Screen
                    name='index'
                    options={{
                        title: 'Home',
                    }}
                />
                <Drawer.Screen
                    name='(groups)'
                    options={{
                        title: 'Groups',
                        headerShown: false,
                        drawerItemStyle: {
                            display: 'none',
                        },
                    }}
                />
                <Drawer.Screen
                    name='(manage)'
                    options={{
                        title: 'Group',
                        headerShown: false,
                        drawerItemStyle: {
                            display: 'none',
                        },
                    }}
                />
                {/* <Drawer.Screen
                    name='(meeting)'
                    options={{
                        title: 'Meeting',
                        headerShown: false,
                        drawerItemStyle: {
                            display: 'none',
                        },
                    }}
                /> */}
                <Drawer.Screen
                    name='(meetings)'
                    options={{
                        title: 'Meetings',
                        headerShown: true,
                        drawerItemStyle: {
                            display: 'none',
                        },
                    }}
                />
                <Drawer.Screen
                    name='profile'
                    options={{
                        title: 'PROfile',
                        headerShown: false,
                        // Profile is now visible in drawer
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}

const styles = {
    menuSectionHeader: {
        padding: 0,
        paddingTop: 8,
        marginBottom: 0,
    },
    menuIndentedItem: {
        marginVertical: 0,
        paddingVertical: 0,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 12,
        borderWidth: 0,
        borderColor: 'transparent',
    },
};
