import theme from '@assets/Colors';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
type CustomButtonProps = {
    onPress: () => void;
    text: string;
    type?:
        | 'PRIMARY'
        | 'SECONDARY'
        | 'TERTIARY'
        | 'DELETE'
        | 'CANCEL'
        | 'STANDARD';
    enabled?: boolean;
    bgColor?: string;
    fgColor?: string;
};

const CustomButton: React.FC<CustomButtonProps> = ({
    onPress,
    text,
    type = 'PRIMARY',
    enabled = true,
    bgColor,
    fgColor,
}) => {
    let cStyle;
    let tStyle;
    switch (type) {
        case 'PRIMARY':
            cStyle = 'container_PRIMARY';
            tStyle = 'text_PRIMARY';
            break;
        case 'SECONDARY':
            cStyle = 'container_SECONDARY';
            tStyle = 'text_SECONDARY';
            break;
        case 'TERTIARY':
            cStyle = 'container_TERTIARY';
            tStyle = 'text_TERTIARY';
            break;
        case 'DELETE':
            cStyle = 'container_DELETE';
            tStyle = 'text_DELETE';
            break;
        case 'CANCEL':
            cStyle = 'container_CANCEL';
            tStyle = 'text_CANCEL';
            break;
        case 'STANDARD':
            cStyle = 'container_STANDARD';
            tStyle = 'text_STANDARD';
            break;
        default:
            break;
    }
    return (
        <>
            {enabled && (
                <Pressable
                    onPress={onPress}
                    style={[
                        styles.container,
                        styles[cStyle],
                        bgColor ? { backgroundColor: bgColor } : {},
                    ]}
                >
                    <Text
                        style={[
                            styles.text,
                            styles[tStyle],
                            fgColor ? { color: fgColor } : {},
                        ]}
                    >
                        {text}
                    </Text>
                </Pressable>
            )}
        </>
    );
};

export default CustomButton;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 15,
        marginVertical: 5,
        alignItems: 'center',
        borderRadius: 5,
    },
    container_PRIMARY: {
        backgroundColor: theme.colors.buttonFillMedium,
    },
    container_SECONDARY: {
        borderColor: theme.colors.buttonFillMedium,
        borderWidth: 2,
    },
    container_CANCEL: {
        backgroundColor: theme.colors.lightGrey,
    },
    container_DELETE: {},
    container_TERTIARY: {},
    container_STANDARD: {
        minWidth: 120,
    },
    text: {
        color: theme.colors.white,
        fontWeight: '700',
    },
    text_TERTIARY: {
        color: theme.colors.lightGrey,
    },
    text_SECONDARY: {
        color: theme.colors.blue,
    },
    text_DELETE: {
        color: theme.colors.white,
        fontSize: 20,
        fontWeight: '600',
    },
    text_CANCEL: {
        color: theme.colors.black,
        fontWeight: '600',
        fontSize: 20,
    },
});
