import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type InputProps = {
    label?: string;
    labelStyle?: any;
    textInputConfig?: any;
};

const Input = ({ label, labelStyle, textInputConfig }: InputProps) => {
    const inputStyles: any[] = [styles.input];
    if (textInputConfig && textInputConfig.multiline) {
        inputStyles.push(styles.inputMultiline);
    }
    return (
        <>
            <View>
                {label && (
                    <View>
                        <Text style={labelStyle}>{label}</Text>
                    </View>
                )}
                <View style={[]}>
                    <TextInput style={inputStyles} {...textInputConfig} />
                </View>
            </View>
        </>
    );
};

export default Input;

const styles = StyleSheet.create({
    input: {
        height: 20,
    },
    inputMultiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    inputContainer: {},
});
