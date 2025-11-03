import themedStyles from '@assets/Styles';
import { Ionicons } from '@expo/vector-icons';
import { fetchProfilePicture } from '@features/user/userThunks';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const Profile = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);
    const profile = user?.profile || {};
    const system = useSelector((state: any) => state.system);
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
        <ScrollView style={themedStyles.userContainer}>
            {/* Header Section */}
            <View style={themedStyles.userHeader}>
                <TouchableOpacity
                    style={themedStyles.userBackButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name='arrow-back' size={24} color='#000' />
                    <Text style={themedStyles.userBackText}>Back</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Image Section */}
            <View style={themedStyles.userProfileImageContainer}>
                {imageLoading ? (
                    <View
                        style={[
                            themedStyles.userProfileImage,
                            themedStyles.userLoadingContainer,
                        ]}
                    >
                        <Text style={themedStyles.userLoadingText}>
                            Loading...
                        </Text>
                    </View>
                ) : profile.pictureObject &&
                  typeof profile.pictureObject === 'string' ? (
                    <Image
                        source={{ uri: profile.pictureObject }}
                        style={themedStyles.userProfileImage}
                    />
                ) : (
                    <Image
                        source={
                            profile.pictureObject ||
                            require('@assets/images/genericProiflePicture.png')
                        }
                        style={themedStyles.userProfileImage}
                    />
                )}
            </View>

            {/* Name Section */}
            <View style={themedStyles.userNameContainer}>
                <Text style={themedStyles.userName}>
                    {profile.firstName || ''} {profile.lastName || ''}
                </Text>
                <Text style={themedStyles.userUsername}>
                    {profile.username || ''}
                </Text>
            </View>

            {/* Profile Details */}
            <View style={themedStyles.userDetailsContainer}>
                <View style={themedStyles.userDetailItem}>
                    <Text style={themedStyles.userDetailLabel}>
                        Phone number
                    </Text>
                    <Text style={themedStyles.userDetailValue}>
                        {formatPhoneNumber(profile.phone)}
                    </Text>
                </View>

                <View style={themedStyles.userDivider} />

                <View style={themedStyles.userDetailItem}>
                    <Text style={themedStyles.userDetailLabel}>Email</Text>
                    <Text style={themedStyles.userDetailValue}>
                        {profile.email || 'Not provided'}
                    </Text>
                </View>

                <View style={themedStyles.userDivider} />

                <View style={themedStyles.userDetailItem}>
                    <Text style={themedStyles.userDetailLabel}>Birthday</Text>
                    <Text style={themedStyles.userDetailValue}>
                        {formatDate(profile.birthday)}
                    </Text>
                </View>

                <View style={themedStyles.userDivider} />

                <View style={themedStyles.userDetailItem}>
                    <Text style={themedStyles.userDetailLabel}>Shirt Size</Text>
                    <Text style={themedStyles.userDetailValue}>
                        {profile.shirt || 'Not provided'}
                    </Text>
                </View>

                <View style={themedStyles.userDivider} />

                <View style={themedStyles.userDetailItem}>
                    <Text style={themedStyles.userDetailLabel}>Address</Text>
                    <Text style={themedStyles.userDetailValue}>
                        {formatAddress()}
                    </Text>
                </View>

                <View style={themedStyles.userDivider} />

                <View style={themedStyles.userDetailItem}>
                    <Text style={themedStyles.userDetailLabel}>
                        Current Organization
                    </Text>
                    <Text style={themedStyles.userDetailValue}>
                        {system?.activeOrg?.name || 'Not provided'}
                    </Text>
                </View>
                {/* Edit Button */}
                <TouchableOpacity
                    style={themedStyles.userEditButton}
                    onPress={() =>
                        router.push('/(drawer)/(user)/(edit)/editProfile')
                    }
                >
                    <Text style={themedStyles.userEditButtonText}>Edit</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default Profile;
