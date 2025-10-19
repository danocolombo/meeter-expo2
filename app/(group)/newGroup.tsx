import theme from '@assets/Colors';
import themedStyles from '@assets/Styles';
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
            style={themedStyles.safeAreaView}
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
                        contentContainerStyle={themedStyles.newGroupContainer}
                        keyboardShouldPersistTaps='handled'
                    >
                        {/* ...existing input fields... */}
                        <View style={themedStyles.newGroupSection}>
                            <Text style={themedStyles.label}>Group Type</Text>
                            <GenderSelectors
                                pick={gender}
                                setPick={setGender}
                            />
                        </View>
                        <View style={themedStyles.newGroupSection}>
                            <Text style={themedStyles.label}>Attendance</Text>
                            <NumberInputEditable
                                value={attendance}
                                onAction={setAttendance}
                                min={0}
                                max={999}
                                numberStyle={{}}
                                graphicStyle={{}}
                            />
                        </View>
                        <View style={themedStyles.newGroupSection}>
                            <Text style={themedStyles.label}>Title *</Text>
                            <RNTextInput
                                style={[
                                    themedStyles.input,
                                    !isTitleValid &&
                                        title.length > 0 &&
                                        themedStyles.inputError,
                                ]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder='Group Title'
                                maxLength={25}
                                autoCapitalize='words'
                                returnKeyType='next'
                            />
                            {!isTitleValid && title.length > 0 && (
                                <Text style={themedStyles.error}>
                                    3-25 alphanumeric chars required
                                </Text>
                            )}
                        </View>
                        <View style={themedStyles.newGroupSection}>
                            <Text style={themedStyles.label}>Location *</Text>
                            <RNTextInput
                                style={[
                                    themedStyles.input,
                                    !isLocationValid &&
                                        location.length > 0 &&
                                        themedStyles.inputError,
                                ]}
                                value={location}
                                onChangeText={setLocation}
                                placeholder='Location'
                                maxLength={25}
                                autoCapitalize='words'
                                returnKeyType='next'
                            />
                            {!isLocationValid && location.length > 0 && (
                                <Text style={themedStyles.error}>
                                    3-25 alphanumeric chars required
                                </Text>
                            )}
                        </View>
                        <View style={themedStyles.newGroupSection}>
                            <Text style={themedStyles.label}>Facilitator</Text>
                            <RNTextInput
                                style={[
                                    themedStyles.input,
                                    !isFacilitatorValid &&
                                        facilitator.length > 0 &&
                                        themedStyles.inputError,
                                ]}
                                value={facilitator}
                                onChangeText={setFacilitator}
                                placeholder='Facilitator'
                                maxLength={25}
                                autoCapitalize='words'
                                returnKeyType='next'
                            />
                        </View>
                        <View style={themedStyles.newGroupSection}>
                            <Text style={themedStyles.label}>
                                Co-Facilitator
                            </Text>
                            <RNTextInput
                                style={[
                                    themedStyles.input,
                                    !isCofacilitatorValid &&
                                        cofacilitator.length > 0 &&
                                        themedStyles.inputError,
                                ]}
                                value={cofacilitator}
                                onChangeText={setCofacilitator}
                                placeholder='Co-Facilitator'
                                maxLength={25}
                                autoCapitalize='words'
                                returnKeyType='next'
                            />
                        </View>
                        <View style={themedStyles.newGroupSection}>
                            <Text style={themedStyles.label}>Notes</Text>
                            <RNTextInput
                                ref={notesInputRef}
                                style={[
                                    themedStyles.input,
                                    !isNotesValid &&
                                        notes.length > 0 &&
                                        themedStyles.inputError,
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
                            <Text style={themedStyles.error}>{error}</Text>
                        ) : null}
                        <View style={themedStyles.buttonRow}>
                            {canSubmit && (
                                <TouchableOpacity
                                    style={themedStyles.saveButton}
                                    onPress={handleSubmit}
                                    disabled={submitting}
                                >
                                    <Text style={themedStyles.saveText}>
                                        {submitting ? 'Saving...' : 'Save'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </RNScrollView>
                    {submitting && (
                        <View style={themedStyles.activityOverlay}>
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

export default NewGroup;
