import { NavigationDrawerContent } from '@components/ui/Drawer';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
    return (
        <GestureHandlerRootView>
            <Drawer
                drawerContent={NavigationDrawerContent}
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
