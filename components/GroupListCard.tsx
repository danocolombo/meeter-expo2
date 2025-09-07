import theme from '@/assets/Colors';
import { GenderStrings } from '@/constants/meeter';
import type { FullGroup, Group } from '@/types/interfaces';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
type GroupListCardProps = {
    group: Group | FullGroup;
};
const GroupListCard = ({ group }: GroupListCardProps) => {
    const router = useRouter();
    // Type guard for gender keys
    const genderKeys: (keyof typeof GenderStrings)[] = ['m', 'f', 'x'];
    const gender = genderKeys.includes(group.gender as any)
        ? GenderStrings[group.gender as keyof typeof GenderStrings]
        : 'Unknown';
    function handleDeleteClick(): void {
        throw new Error('Function not implemented.');
    }

    return (
        <>
            <Pressable
                style={localStyle.groupCard}
                onPress={() => {
                    const params = new URLSearchParams({
                        title: group.title ?? '',
                        location: group.location ?? '',
                        facilitator: group.facilitator ?? '',
                        gender: group.gender ?? '',
                    }).toString();
                    router.push(`/(group)/${group.id}?${params}`);
                }}
            >
                <View style={localStyle.groupItem}>
                    <View style={localStyle.wrapper}>
                        <View style={localStyle.genderIconContainer}>
                            <Text>ICON</Text>
                        </View>

                        <View style={localStyle.column2}>
                            <View style={localStyle.textWrapper}>
                                <Text style={localStyle.titleText}>
                                    {group.title.trim()}
                                </Text>

                                <Text style={localStyle.locationText}>
                                    {(group.location ?? '').trim()}
                                </Text>

                                <View>
                                    <Text style={localStyle.facilitatorText}>
                                        {(group.facilitator ?? '').trim()}
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={localStyle.trashIconWrapper}
                                pointerEvents='box-none'
                            >
                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick();
                                    }}
                                >
                                    <View>
                                        <Text>TRASH</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Pressable>
        </>
    );
};

export default GroupListCard;

const localStyle = StyleSheet.create({
    groupCard: {
        minWidth: '100%',
        flex: 1,
        gap: 8,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
    },
    pressed: {
        opacity: 0.75,
    },
    groupItem: {
        marginVertical: 5,
        paddingBottom: 5,
        backgroundColor: 'darkgrey',
        flexDirection: 'row',
        //justifyContent: 'space-between',
        borderRadius: 10,
        elevation: 3,
        shadowColor: 'yellow',
        shadowRadius: 4,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
    },
    meetingCardActivePrimary: {
        backgroundColor: theme.colors.groupActiveCard,
    },
    meetingCardHistoricPrimary: {
        backgroundColor: theme.colors.groupHistoricCard,
    },
    wrapper: {
        flexDirection: 'row',
        paddingVertical: 5,
    },
    genderIconContainer: {
        marginTop: 20,
        paddingHorizontal: 5,
    },

    trashIconWrapper: {
        justifyContent: 'center',
        paddingRight: 15,
    },
    column2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '85%',
    },
    textWrapper: {
        width: '85%',
    },
    titleText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        paddingLeft: 0,
        letterSpacing: 0.5,
    },
    locationText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        paddingLeft: 0,
        textAlign: 'left',
        letterSpacing: 0.5,
    },
    facilitatorText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        paddingLeft: 0,
        letterSpacing: 0.5,
    },
});
