import { Stack } from 'expo-router';

export default function EditLayout() {
    return (
        <Stack>
            {/* Child stack should not render its own header — the parent stack will show the navigation header.
                This avoids duplicate headers (parent + child). */}
            <Stack.Screen
                name='[id]'
                options={{ title: 'Edit Meeting', headerShown: false }}
            />
        </Stack>
    );
}
