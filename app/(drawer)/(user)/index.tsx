import theme from '@assets/Colors';
import { Ionicons } from '@expo/vector-icons';
import { fetchProfilePicture } from '@features/user/userThunks';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const Profile = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);
    const profile = user?.profile || {};
    const [imageLoading, setImageLoading] = useState(false);

    // Fetch profile picture if user has one and it's not already cached
    useEffect(() => {
        console.log('🖼️ Profile picture check:', {
            hasPicture: !!profile.picture,
            hasId: !!profile.id,
            hasToken: !!user.apiToken,
            hasCachedObject: !!profile.pictureObject,
            pictureId: profile.picture,
            userId: profile.id,
        });

        if (
            profile.picture &&
            profile.id &&
            user.apiToken &&
            (!profile.pictureObject ||
                typeof profile.pictureObject !== 'string')
        ) {
            console.log('🚀 Fetching profile picture from API...');
            setImageLoading(true);
            (dispatch as any)(
                fetchProfilePicture({
                    userId: profile.id,
                    pictureId: profile.picture,
                })
            )
                .unwrap()
                .then(() => {
                    console.log('✅ Profile picture fetched successfully');
                    // The picture is now stored in Redux state via the fetchProfilePicture.fulfilled reducer
                })
                .catch((error: any) => {
                    console.error('❌ Failed to load profile picture:', error);
                })
                .finally(() => {
                    setImageLoading(false);
                });
        }
    }, [
        profile.picture,
        profile.id,
        user.apiToken,
        profile.pictureObject,
        dispatch,
    ]);

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return 'Not provided';
        return phone;
    };

    const formatDate = (date: string) => {
        if (!date) return 'Not provided';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatAddress = () => {
        const loc = profile?.location;
        if (!loc) return 'Not provided';
        const parts = [];
        if (loc.street) parts.push(loc.street);
        if (loc.city) parts.push(loc.city);
        if (loc.stateProv) parts.push(loc.stateProv);
        if (loc.postalCode) parts.push(loc.postalCode);
        return parts.join(', ') || 'Not provided';
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name='arrow-back' size={24} color='#000' />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Image Section */}
            <View style={styles.profileImageContainer}>
                {imageLoading ? (
                    <View
                        style={[styles.profileImage, styles.loadingContainer]}
                    >
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : profile.pictureObject &&
                  typeof profile.pictureObject === 'string' ? (
                    <Image
                        source={{ uri: profile.pictureObject }}
                        style={styles.profileImage}
                    />
                ) : (
                    <Image
                        source={
                            profile.pictureObject ||
                            require('@assets/images/genericProiflePicture.png')
                        }
                        style={styles.profileImage}
                    />
                )}
            </View>

            {/* Name Section */}
            <View style={styles.nameContainer}>
                <Text style={styles.name}>
                    {profile.firstName || ''} {profile.lastName || ''}
                </Text>
                <Text style={styles.username}>@{profile.username || ''}</Text>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                    router.push('/(drawer)/(user)/(edit)/editProfile')
                }
            >
                <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>

            {/* Profile Details */}
            <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Phone number</Text>
                    <Text style={styles.detailValue}>
                        {formatPhoneNumber(profile.phone)}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>
                        {profile.email || 'Not provided'}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Birthday</Text>
                    <Text style={styles.detailValue}>
                        {formatDate(profile.birthday)}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Shirt Size</Text>
                    <Text style={styles.detailValue}>
                        {profile.shirt || 'Not provided'}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{formatAddress()}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Default Organization</Text>
                    <Text style={styles.detailValue}>
                        {profile.defaultOrg?.name || 'Not provided'}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        fontSize: 18,
        marginLeft: 8,
        color: '#000',
    },
    profileImageContainer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#fff',
    },
    loadingContainer: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#666',
        fontSize: 12,
    },
    nameContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    username: {
        fontSize: 16,
        color: '#666',
    },
    editButton: {
        backgroundColor: theme.colors.primaryBackground,
        marginHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 30,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    detailsContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 30,
    },
    detailItem: {
        paddingVertical: 15,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    detailValue: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
    },
});
