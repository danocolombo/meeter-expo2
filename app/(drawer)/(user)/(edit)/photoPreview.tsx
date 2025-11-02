import theme from '@assets/Colors';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const PhotoPreview = () => {
    const router = useRouter();
    const [facing, setFacing] = useState<CameraType>('front');
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const cameraRef = useRef<CameraView>(null);

    // Handle camera permissions
    if (!permission) {
        // Camera permissions are still loading
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading camera...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>
                        We need your permission to show the camera
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestPermission}
                    >
                        <Text style={styles.permissionButtonText}>
                            Grant Permission
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                });
                if (photo?.uri) {
                    setPhoto(photo.uri);
                    setShowPreview(true);
                }
            } catch (error) {
                console.error('Error taking picture:', error);
                Alert.alert(
                    'Error',
                    'Failed to take picture. Please try again.'
                );
            }
        }
    };

    const retakePicture = () => {
        setPhoto(null);
        setShowPreview(false);
    };

    const handleOK = () => {
        // TODO: Here you would upload the photo with your API
        // For now, we'll just navigate back to the edit profile screen
        Alert.alert(
            'Photo Selected',
            'Photo functionality will be implemented with your API endpoint.',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // You would pass the photo URI back to the parent component
                        // or save it to Redux state here
                        router.back();
                    },
                },
            ]
        );
    };

    const handleCancel = () => {
        router.back();
    };

    const toggleCameraFacing = () => {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    };

    if (showPreview && photo) {
        return (
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleCancel}
                    >
                        <Ionicons name='arrow-back' size={24} color='#000' />
                        <Text style={styles.backText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Photo Preview</Text>
                </View>

                {/* Photo Preview Section - Same format as editProfile */}
                <View style={styles.photoPreviewContainer}>
                    <View style={styles.profileImageWrapper}>
                        <Image
                            source={{ uri: photo }}
                            style={styles.profileImage}
                        />
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.retakeButton}
                        onPress={retakePicture}
                    >
                        <Text style={styles.retakeButtonText}>Retake</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.okButton}
                        onPress={handleOK}
                    >
                        <Text style={styles.okButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleCancel}
                >
                    <Ionicons name='arrow-back' size={24} color='#000' />
                    <Text style={styles.backText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Take Photo</Text>
            </View>

            {/* Camera Section */}
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing={facing}
                    ref={cameraRef}
                />
            </View>

            {/* Camera Controls */}
            <View style={styles.cameraControls}>
                <TouchableOpacity
                    style={styles.flipButton}
                    onPress={toggleCameraFacing}
                >
                    <Ionicons name='camera-reverse' size={32} color='#fff' />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.captureButton}
                    onPress={takePicture}
                >
                    <View style={styles.captureButtonInner} />
                </TouchableOpacity>

                <View style={styles.placeholder} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 100,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    permissionText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: theme.colors.primaryBackground,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 40,
        backgroundColor: '#000',
    },
    flipButton: {
        padding: 10,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#ddd',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    placeholder: {
        width: 52, // Same width as flip button to center capture button
    },
    photoPreviewContainer: {
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 40,
        flex: 1,
        justifyContent: 'center',
    },
    profileImageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 3,
        borderColor: '#fff',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 40,
        paddingVertical: 30,
        backgroundColor: '#fff',
    },
    retakeButton: {
        backgroundColor: '#666',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    retakeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    okButton: {
        backgroundColor: theme.colors.primaryBackground,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    okButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PhotoPreview;
