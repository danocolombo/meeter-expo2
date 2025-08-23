import {
    DrawerContentScrollView,
    DrawerItemList,
    useDrawerStatus,
} from '@react-navigation/drawer';
import { usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomDrawerContent = (props: any) => {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const isDrawerOpen = useDrawerStatus() === 'open';
    const pathName = usePathname();

    useEffect(() => {
        // if (isDrawerOpen) {
        //     loadLocations();
        // }
    }, [isDrawerOpen]);

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView>
                <View>
                    <Text>LOGO</Text>
                </View>
                <View style={styles.locationsContainer}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <View
                style={{
                    paddingBottom: 20 + bottom,
                    borderTopWidth: 1,
                    borderTopColor: '#dde3fe',
                    padding: 16,
                }}
            >
                <Text>Copyright Fortson Guru 2025</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    logo: {
        width: 100,
        height: 100,
        alignSelf: 'center',
    },
    locationsContainer: {
        marginTop: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        padding: 16,
        paddingTop: 24,
        color: '#a6a6a6',
    },
});

const Layout = () => {
    // useDrizzleStudio(db);

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
                    name='(group)'
                    options={{
                        title: 'Group',
                        headerShown: false,
                        drawerItemStyle: {
                            display: 'none',
                        },
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
                <Drawer.Screen
                    name='(meeting)'
                    options={{
                        title: 'Meeting',
                        headerShown: false,
                        // drawerItemStyle: {
                        //     display: 'none',
                        // },
                    }}
                />
                <Drawer.Screen
                    name='(meetings)'
                    options={{
                        title: 'Meeting',
                        headerShown: false,
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
};
export default Layout;
