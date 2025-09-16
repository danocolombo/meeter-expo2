import theme from '@assets/Colors';
import { GenderStrings } from '@constants/meeter';
import type { FullGroup, Group } from '@types/interfaces';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
    fromMeetingId?: string;
};
const GroupListCard = ({ group, fromMeetingId }: GroupListCardProps) => {
    const router = useRouter();
    // Type guard for gender keys
    const genderKeys: (keyof typeof GenderStrings)[] = ['m', 'f', 'x'];
    const gender = genderKeys.includes(group.gender as any)
        ? GenderStrings[group.gender as keyof typeof GenderStrings]
        : 'Unknown';
    function handleDeleteClick(): void {
        throw new Error('Function not implemented.');
    }

    // Get org_id from parent params if available
    const parentParams = useLocalSearchParams();
    return (
        <>
            <Pressable
                style={localStyle.groupCard}
                onPress={() => {
                    const paramsObj: Record<string, string> = {
                        title: group.title ?? '',
                        location: group.location ?? '',
                        facilitator: group.facilitator ?? '',
                        gender: group.gender ?? '',
                    };
                    if (fromMeetingId) {
                        paramsObj.fromMeetingId = fromMeetingId;
                    }
                    if (parentParams.org_id) {
                        paramsObj.org_id = String(parentParams.org_id);
                    }
                    const params = new URLSearchParams(paramsObj).toString();
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
        padding: 1,
        marginBottom: 10,
        borderRadius: 12,
        backgroundColor: theme.colors.cardBackground,
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
    },
    pressed: {
        opacity: 0.75,
    },
    groupItem: {
        marginVertical: 5,
        paddingBottom: 5,
        backgroundColor: theme.colors.cardBackground,
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
        backgroundColor: theme.colors.cardBackground,
    },
    meetingCardHistoricPrimary: {
        backgroundColor: theme.colors.cardBackground,
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
        textAlign: 'left',
        letterSpacing: 0.5,
    },
    locationText: {
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
