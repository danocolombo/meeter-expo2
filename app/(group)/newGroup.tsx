import theme from '@assets/Colors';
import GenderSelectors from '@components/ui/GenderSelectors';
import NumberInputEditable from '@components/ui/NumberInputEditable';
import { addGroup } from '@features/meetings/meetingsThunks';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView as RNScrollView,
    TextInput as RNTextInput,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const NewGroup = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { meetingId: meetingIdRaw } = useLocalSearchParams();
    // Ensure meetingId is always a string
    const meetingId = Array.isArray(meetingIdRaw)
        ? meetingIdRaw[0]
        : meetingIdRaw;
    // Always get org_id from Redux
    // const user = useSelector((state: any) => state.user); // not used
    const api_token = useSelector((state: any) => state.user?.apiToken);

    // Form state
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [facilitator, setFacilitator] = useState('');
    const [cofacilitator, setCofacilitator] = useState('');
    const [notes, setNotes] = useState('');
    const [gender, setGender] = useState('x');
    const [attendance, setAttendance] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Color scheme for dynamic Cancel button color
    const colorScheme = useColorScheme();
    const cancelColor =
        colorScheme === 'dark'
            ? theme.colors.navigateTextLight
            : theme.colors.navigateTextDark;

    // Ref for ScrollView to scroll Notes into view
    const scrollViewRef = useRef<RNScrollView>(null);
    const notesInputRef = useRef<RNTextInput>(null);

    // Validation
    const isTitleValid = /^[a-zA-Z0-9 \-_&]{3,25}$/.test(title);
    const isLocationValid = /^[a-zA-Z0-9 \-_&]{3,25}$/.test(location);
    const isFacilitatorValid =
        facilitator.length === 0 || /^[a-zA-Z0-9 ]{0,25}$/.test(facilitator);
    const isCofacilitatorValid =
        cofacilitator.length === 0 ||
        /^[a-zA-Z0-9 ]{0,25}$/.test(cofacilitator);
    const isNotesValid =
        notes.length === 0 || /^[a-zA-Z0-9 .,!?\-]{0,100}$/.test(notes);
    const canSubmit =
        isTitleValid &&
        isLocationValid &&
        isFacilitatorValid &&
        isCofacilitatorValid &&
        isNotesValid;

    // Top navigation cancel handler
    const handleCancel = useCallback(() => {
        if (meetingId) {
            router.push({
                pathname: '/(meeting)/[id]',
                params: { id: meetingId },
            });
        } else {
            router.push('/(meeting)/[id]');
        }
    }, [meetingId, router]);

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        const group = {
            title: title.trim(),
            location: location.trim(),
            gender,
            attendance,
            facilitator: facilitator.trim() || null,
            cofacilitator: cofacilitator.trim() || null,
            notes: notes.trim() || null,
        };
        try {
            console.log('Submitting new group:', {
                api_token,
                group,
                meetingId,
            });
            await dispatch(
                // @ts-ignore
                addGroup({ api_token, group, meetingId })
            ).unwrap();
            handleCancel();
        } catch (err) {
            console.log('Failed to add group:', {
                error: err,
                request: { api_token, group, meetingId },
            });
            setError('Failed to add group. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    useLayoutEffect(() => {
        // Set headerLeft using navigation.setOptions to avoid non-serializable params
        navigation.setOptions &&
            navigation.setOptions({
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={handleCancel}
                        style={{ marginLeft: 16 }}
                    >
                        <Text
                            style={{
                                color: cancelColor,
                                fontSize: 18,
                            }}
                        >
                            {'Cancel'}
                        </Text>
                    </TouchableOpacity>
                ),
            });
    }, [handleCancel, cancelColor, navigation]);

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.colors.primaryBackground }}
            edges={['bottom', 'left', 'right']}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
            >
                <View style={{ flex: 1 }}>
                    <RNScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.container}
                        keyboardShouldPersistTaps='handled'
                    >
                        {/* ...existing input fields... */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Group Type</Text>
                            <GenderSelectors
                                pick={gender}
                                setPick={setGender}
                            />
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.label}>Attendance</Text>
                            <NumberInputEditable
                                value={attendance}
                                onAction={setAttendance}
                                min={0}
                                max={999}
                                numberStyle={{}}
                                graphicStyle={{}}
                            />
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.label}>Title *</Text>
                            <RNTextInput
                                style={[
                                    styles.input,
                                    !isTitleValid &&
                                        title.length > 0 &&
                                        styles.inputError,
                                ]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder='Group Title'
                                maxLength={25}
                                autoCapitalize='words'
                                returnKeyType='next'
                            />
                            {!isTitleValid && title.length > 0 && (
                                <Text style={styles.errorText}>
                                    3-25 alphanumeric chars required
                                </Text>
                            )}
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.label}>Location *</Text>
                            <RNTextInput
                                style={[
                                    styles.input,
                                    !isLocationValid &&
                                        location.length > 0 &&
                                        styles.inputError,
                                ]}
                                value={location}
                                onChangeText={setLocation}
                                placeholder='Location'
                                maxLength={25}
                                autoCapitalize='words'
                                returnKeyType='next'
                            />
                            {!isLocationValid && location.length > 0 && (
                                <Text style={styles.errorText}>
                                    3-25 alphanumeric chars required
                                </Text>
                            )}
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.label}>Facilitator</Text>
                            <RNTextInput
                                style={[
                                    styles.input,
                                    !isFacilitatorValid &&
                                        facilitator.length > 0 &&
                                        styles.inputError,
                                ]}
                                value={facilitator}
                                onChangeText={setFacilitator}
                                placeholder='Facilitator'
                                maxLength={25}
                                autoCapitalize='words'
                                returnKeyType='next'
                            />
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.label}>Co-Facilitator</Text>
                            <RNTextInput
                                style={[
                                    styles.input,
                                    !isCofacilitatorValid &&
                                        cofacilitator.length > 0 &&
                                        styles.inputError,
                                ]}
                                value={cofacilitator}
                                onChangeText={setCofacilitator}
                                placeholder='Co-Facilitator'
                                maxLength={25}
                                autoCapitalize='words'
                                returnKeyType='next'
                            />
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.label}>Notes</Text>
                            <RNTextInput
                                ref={notesInputRef}
                                style={[
                                    styles.input,
                                    !isNotesValid &&
                                        notes.length > 0 &&
                                        styles.inputError,
                                ]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder='Notes'
                                maxLength={100}
                                multiline
                                textAlignVertical='top'
                                returnKeyType='done'
                                onFocus={() => {
                                    setTimeout(() => {
                                        if (scrollViewRef.current) {
                                            scrollViewRef.current.scrollTo({
                                                y: 500,
                                                animated: true,
                                            });
                                        }
                                    }, 250);
                                }}
                            />
                        </View>
                        {error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : null}
                        <View style={styles.buttonRow}>
                            {canSubmit && (
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSubmit}
                                    disabled={submitting}
                                >
                                    <Text style={styles.saveText}>
                                        {submitting ? 'Saving...' : 'Save'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </RNScrollView>
                    {submitting && (
                        <View style={styles.activityOverlay}>
                            <ActivityIndicator
                                size='large'
                                color={theme.colors.accent}
                            />
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingTop: 32,
        alignItems: 'center',
        backgroundColor: theme.colors.primaryBackground,
        paddingBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        color: theme.colors.lightText,
    },
    meetingIdText: {
        marginBottom: 12,
        fontSize: 16,
        color: 'gray',
    },
    section: {
        width: '90%',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
        color: theme.colors.lightText,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.accent,
        borderRadius: 6,
        padding: 10,
        fontSize: 18,
        backgroundColor: 'white',
        color: theme.colors.darkText,
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 2,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginTop: 24,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#ccc',
        borderRadius: 8,
        marginRight: 10,
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: theme.colors.accent,
        borderRadius: 8,
    },
    saveText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    activityOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
});

export default NewGroup;
