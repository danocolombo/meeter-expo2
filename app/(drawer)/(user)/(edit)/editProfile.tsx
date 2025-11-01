import theme from '@assets/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActionSheetIOS,
    Alert,
    Image,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
// import { useDispatch } from 'react-redux'; // TODO: Uncomment when implementing save functionality

const EditProfile = () => {
    const router = useRouter();
    // const dispatch = useDispatch(); // TODO: Uncomment when implementing save functionality
    const user = useSelector((state: any) => state.user);
    const profile = user?.profile || {};

    // State for editable fields
    const [phone, setPhone] = useState(profile.phone || '');
    const [shirt, setShirt] = useState(profile.shirt || '');
    const [birthday, setBirthday] = useState(profile.birthday || '');
    const [street, setStreet] = useState(profile.location?.street || '');
    const [city, setCity] = useState(profile.location?.city || '');
    const [stateProv, setStateProv] = useState(
        profile.location?.stateProv || ''
    );
    const [postalCode, setPostalCode] = useState(
        profile.location?.postalCode || ''
    );

    const shirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

    const handlePictureEdit = () => {
        console.log('PIC EDIT PRESSED');
    };

    const handleShirtSizePress = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: ['Cancel', ...shirtSizes],
                cancelButtonIndex: 0,
            },
            (buttonIndex) => {
                if (buttonIndex > 0) {
                    setShirt(shirtSizes[buttonIndex - 1]);
                }
            }
        );
    };

    const handleSave = () => {
        // TODO: Implement save logic with your API
        // For now, we'll just show an alert
        Alert.alert(
            'Save Profile',
            'Profile update functionality will be implemented with your API endpoint.',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // You would dispatch an action here to update the profile
                        // Example:
                        // dispatch(updateProfile({
                        //     phone,
                        //     shirt,
                        //     birthday,
                        //     location: { street, city, stateProv, postalCode }
                        // }));
                        router.back();
                    },
                },
            ]
        );
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancel',
            'Are you sure you want to discard your changes?',
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => router.back(),
                },
            ]
        );
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior='padding'>
            <ScrollView style={styles.scrollView}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleCancel}
                    >
                        <Ionicons name='arrow-back' size={24} color='#000' />
                        <Text style={styles.backText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                </View>

                {/* Profile Picture Section */}
                <View style={styles.profileImageContainer}>
                    <View style={styles.profileImageWrapper}>
                        {profile.picture ? (
                            <Image
                                source={{ uri: profile.picture }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <Image
                                source={require('@assets/images/mock-profile-sample.png')}
                                style={styles.profileImage}
                            />
                        )}
                        <TouchableOpacity
                            style={styles.cameraIconContainer}
                            onPress={handlePictureEdit}
                        >
                            <MaterialIcons
                                name='camera-alt'
                                size={24}
                                color='#fff'
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Section */}
                <View style={styles.formContainer}>
                    {/* Phone Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder='Enter phone number'
                            keyboardType='phone-pad'
                        />
                    </View>

                    {/* Birthday */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Birthday</Text>
                        <TextInput
                            style={styles.input}
                            value={birthday}
                            onChangeText={setBirthday}
                            placeholder='YYYY-MM-DD'
                        />
                        <Text style={styles.helperText}>
                            Format: YYYY-MM-DD
                        </Text>
                    </View>

                    {/* Shirt Size */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Shirt Size</Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={handleShirtSizePress}
                        >
                            <Text
                                style={[
                                    styles.dropdownButtonText,
                                    !shirt && styles.dropdownPlaceholderText,
                                ]}
                            >
                                {shirt || 'Select shirt size'}
                            </Text>
                            <Ionicons
                                name='chevron-down'
                                size={20}
                                color='#666'
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Address Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Address</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Street</Text>
                        <TextInput
                            style={styles.input}
                            value={street}
                            onChangeText={setStreet}
                            placeholder='Enter street address'
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City</Text>
                        <TextInput
                            style={styles.input}
                            value={city}
                            onChangeText={setCity}
                            placeholder='Enter city'
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <View style={styles.inputGroupHalf}>
                            <Text style={styles.label}>State</Text>
                            <TextInput
                                style={styles.input}
                                value={stateProv}
                                onChangeText={setStateProv}
                                placeholder='State'
                                maxLength={2}
                                autoCapitalize='characters'
                            />
                        </View>

                        <View style={styles.inputGroupHalf}>
                            <Text style={styles.label}>Postal Code</Text>
                            <TextInput
                                style={styles.input}
                                value={postalCode}
                                onChangeText={setPostalCode}
                                placeholder='ZIP Code'
                                keyboardType='numeric'
                            />
                        </View>
                    </View>

                    {/* Read-only Information */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Account Information (Read-only)
                        </Text>
                    </View>

                    <View style={styles.readOnlyGroup}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.readOnlyText}>
                            {profile.firstName || ''} {profile.lastName || ''}
                        </Text>
                    </View>

                    <View style={styles.readOnlyGroup}>
                        <Text style={styles.label}>Username</Text>
                        <Text style={styles.readOnlyText}>
                            {profile.username || ''}
                        </Text>
                    </View>

                    <View style={styles.readOnlyGroup}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.readOnlyText}>
                            {profile.email || ''}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    backText: {
        fontSize: 16,
        marginLeft: 8,
        color: '#000',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
    },
    profileImageContainer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    profileImageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#fff',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primaryBackground,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    formContainer: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputGroupHalf: {
        flex: 1,
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    dropdownButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#000',
    },
    dropdownPlaceholderText: {
        color: '#999',
    },
    sectionHeader: {
        marginTop: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    readOnlyGroup: {
        marginBottom: 15,
    },
    readOnlyText: {
        fontSize: 16,
        color: '#666',
        paddingVertical: 8,
    },
    footer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    saveButton: {
        backgroundColor: theme.colors.primaryBackground,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
