import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@utils/store';
import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});
export default function RootLayout() {
    useReactQueryDevTools(queryClient);
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <Slot />
            </QueryClientProvider>
        </Provider>
    );
}
