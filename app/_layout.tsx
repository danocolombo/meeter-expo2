import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@utils/store';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { AuthProvider } from './(hooks)/AuthProvider';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});
export default function RootLayout() {
    useReactQueryDevTools(queryClient);
    const [fontsLoaded] = useFonts({
        'Merriweather-Bold': require('@assets/fonts/Merriweather-Bold.ttf'),
        'Roboto-Black': require('@assets/fonts/Roboto-Black.ttf'),
        'Roboto-BlackItalic': require('@assets/fonts/Roboto-BlackItalic.ttf'),
        'Roboto-Bold': require('@assets/fonts/Roboto-Bold.ttf'),
        'Roboto-BoldItalic': require('@assets/fonts/Roboto-BoldItalic.ttf'),
        'Roboto-Italic': require('@assets/fonts/Roboto-Italic.ttf'),
        'Roboto-Light': require('@assets/fonts/Roboto-Light.ttf'),
        'Roboto-LightItalic': require('@assets/fonts/Roboto-LightItalic.ttf'),
        'Roboto-Medium': require('@assets/fonts/Roboto-Medium.ttf'),
        'Roboto-MediumItalic': require('@assets/fonts/Roboto-MediumItalic.ttf'),
        'Roboto-Regular': require('@assets/fonts/Roboto-Regular.ttf'),
        'Roboto-Thin': require('@assets/fonts/Roboto-Thin.ttf'),
        'Roboto-ThinItalic': require('@assets/fonts/Roboto-ThinItalic.ttf'),
        'NanumGothic-Regular': require('@assets/fonts/NanumGothic-Regular.ttf'),
        'NanumGothic-Bold': require('@assets/fonts/NanumGothic-Bold.ttf'),
        'NanumGothic-ExtraBold': require('@assets/fonts/NanumGothic-ExtraBold.ttf'),
    });
    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.preventAutoHideAsync();
            // await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);
    if (!fontsLoaded) {
        return null;
    }
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <Slot />
                    </AuthProvider>
                </QueryClientProvider>
            </Provider>
        </GestureHandlerRootView>
    );
}
