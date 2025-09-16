import { createSlice } from '@reduxjs/toolkit';
import { isDateDashBeforeToday, printObject } from '@utils/helpers';
import {
    addDefaultGroups,
    addGroup,
    addMeeting as addMeetingLegacy,
    deleteGroupFromMeeting,
    deleteMeeting,
    fetchAllMeetings,
    fetchMeetingDetailsById,
    getAllMeetings,
    getSpecificMeeting,
    loadHistoricPage,
    refreshActiveMeetings,
    saveCurrentMeetingAndGroups,
    saveNewMeeting,
    updateGroup,
    updateMeeting,
} from './meetingsThunks';
// helper function to append historic meetings for
// pagination.

function updateHistoricMeetings(existingMeetings, additionalMeetings) {
    printObject('MS:40-->existingMeetings.count', existingMeetings.count);
    printObject('MS:41-->additionalMeetings.count', additionalMeetings.count);
    return existingMeetings.reduce(
        (updatedMeetings, newMeeting) => {
            const existingMeetingIndex = updatedMeetings.findIndex(
                (meeting) => meeting.id === newMeeting.id
            );

            if (existingMeetingIndex !== -1) {
                // Replace existing meeting with the new one
                updatedMeetings[existingMeetingIndex] = newMeeting;
            } else {
                // Append the new meeting if not found
                updatedMeetings.push(newMeeting);
            }

            return updatedMeetings;
        },
        [...existingMeetings]
    ); // Create a copy to avoid mutation
}
const initialState = {
    meetings: [],
    activeMeetings: [],
    activeCurrentPage: 0,
    activeLastPage: 0,
    historicMeetings: [],
    additionalHistoricMeetings: [],
    historicCurrentPage: 0,
    historicLastPage: 0,
    specificMeeting: {},
    groups: [],
    tmpMeeting: {},
    currentMeeting: {},
    currentGroups: [],
    isLoading: false,
};

export const meetingsSlice = createSlice({
    name: 'meetings',
    initialState,
    reducers: {
        createTmp: (state, action) => {
            state.tmpMeeting = {};
            state.tmpMeeting = action.payload[0];
            return state;
        },
        updateTmp: (state, action) => {
            let newTmp = Object.assign(state.tmpMeeting, action.payload);
            state.tmpMeeting = newTmp;
            return state;
        },
        loadMeetings: (state, action) => {
            state.meetings = action.payload;
            return state;
        },

        getMeetings: (state, action) => {
            return state.meetings;
        },
        loadGroups: (state, action) => {
            const wasGroups = action.payload;
            let newGroups = [];
            wasGroups.forEach((item) => {
                newGroups.push(item);
            });
            function asc_sort(b, a) {
                if (a.gender === b.gender) {
                    return a.title - b.title;
                }
                return a.gender > b.gender ? 1 : -1;
            }
            function newDoubleSort(prop1, prop2) {
                return function (a, b) {
                    if (a[prop1] === b[prop1]) {
                        return b[prop2] - a[prop2];
                    }
                    return a[prop1] > b[prop1] ? 1 : -1;
                };
            }
            let doubleResults = newGroups.sort(
                newDoubleSort('gender', 'title')
            );
            // let sortedGroups = theGroups.sort(asc_sort);
            state.groups = doubleResults;
            return state;
        },
        getGroup: (state, action) => {
            const grp = state.groups.filter(
                (g) => g.meetingId === action.payload
            );
            return grp;
        },

        addANewMeeting: (state, action) => {
            // if the meeting does not exist, add it.
            console.log('✝️✝️✝️✝️✝️✝️ ms:134->addANewMeeting');
            if (!state.meetings.find((m) => m.id === action.payload.id)) {
                const newMeetings = [...state.meetings, action.payload];
                state.meetings = newMeetings;
            }
            return state;
        },
        deleteAMeeting: (state, action) => {
            const existingMeetings = state.meetings;
            const updatedMeetings = existingMeetings.filter((m) => {
                if (m.id !== action.payload.id) {
                    return m;
                }
            });
            state.meetings = updatedMeetings;
            state.isLoading = false;
            return state;
        },
        deleteCurrentMeetingAndGroups: (state, action) => {
            return {
                ...state,
                currentMeeting: {},
                currentGroups: [],
            };
        },
        deleteGroup: (state, action) => {
            const smaller = state.groups.filter(
                (m) => m.groupId !== action.payload.groupId
            );
            state.groups = smaller;
            return state;
        },
        clearGroups: (state) => {
            state.groups = [];
            return state;
        },
        incrementHistoricCurrentPage: (state) => {
            console.log('incrementHistoricCurrentPage HIT');

            return {
                ...state,
                historicCurrentPage: state.historicCurrentPage + 1,
            };
        },
        clearMeetingsSlice: (state) => {
            state.meetings = [];
            state.specificMeeting = {};
            state.groups = [];
            state.tmpMeeting = {};
        },
        logout: (state) => {
            state.meetings = [];
            state.activeMeetings = [];
            state.activeCurrentPage = '88';
            state.activeLastPage = '';
            state.historicMeetings = [];
            state.additionalHistoricMeetings = [];
            state.historicCurrentPage = '';
            state.historicLastPage = '';
            state.specificMeeting = {};
            state.groups = [];
            state.tmpMeeting = {};
            state.currentMeeting = {};
            state.currentGroups = [];
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(deleteMeeting.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteMeeting.fulfilled, (state, action) => {
                const meetingIdToDelete = action.payload.data.meeting_id;
                //* we are not sure if meeting is active or history
                //* do both.
                const activeMeetings = state.activeMeetings.filter(
                    (mtg) => mtg.id !== meetingIdToDelete
                );
                const historicMeetings = state.historicMeetings.filter(
                    (mtg) => mtg.id !== meetingIdToDelete
                );
                return {
                    ...state,
                    activeMeetings: activeMeetings,
                    historicMeetings: historicMeetings,
                    isLoading: false,
                };
            })
            .addCase(deleteMeeting.rejected, (state, action) => {
                printObject(
                    'MS:219-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(getSpecificMeeting.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getSpecificMeeting.fulfilled, (state, action) => {
                const mtg = state.meetings.filter(
                    (m) => m.id === action.payload
                );
                state.specificMeeting = { ...mtg };
                state.isLoading = false;
                return state;
            })
            .addCase(getSpecificMeeting.rejected, (state, action) => {
                printObject(
                    'MS:219-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(getAllMeetings.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllMeetings.fulfilled, (state, action) => {
                try {
                    if (action.payload.status === '200') {
                        const newMeetings = [...action.payload.meetings.all];
                        const newActives = [...action.payload.meetings.active];
                        const newHistorics = [
                            ...action.payload.meetings.historic,
                        ];
                        return {
                            ...state,
                            meetings: newMeetings,
                            // activeMeetings: newActives,
                            // historicMeetings: newHistorics,
                            isLoading: false,
                        };
                    } else {
                        return {
                            meetings: [],
                            // activeMeetings: [],
                            // historicMeetings: [],
                            isLoading: false,
                        };
                    }
                } catch (error) {
                    printObject('MS:230-->error getting all meetings\n', error);
                }
                state.isLoading = false;
                return state;
            })
            .addCase(getAllMeetings.rejected, (state, action) => {
                printObject(
                    'MS:219-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(addGroup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addGroup.fulfilled, (state, action) => {
                const groupId = action.payload.group_id;

                state.activeMeetings.forEach((meeting) => {
                    if (meeting?.groups?.length > 0) {
                        if (!meeting.groups.includes(groupId)) {
                            meeting.groups.push(groupId);
                        }
                    }
                });

                state.historicMeetings.forEach((meeting) => {
                    if (!meeting.groups.includes(groupId)) {
                        meeting.groups.push(groupId);
                    }
                });

                state.isLoading = false;
                return state;
            })
            .addCase(addGroup.rejected, (state, action) => {
                printObject(
                    '<MS:267></MS:267>-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(updateGroup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateGroup.fulfilled, (state, action) => {
                printObject(
                    '🥎🥎🥎MS:314-->updateGroup.FULFILLED:action.payload:\n',
                    action.payload
                );
                const group = action.payload;
                const meeting_id = group.meeting_id;
                const group_id = group.id;

                // Update activeMeetings
                state.activeMeetings.forEach((meeting) => {
                    if (meeting.id === meeting_id) {
                        const groupIndex = meeting.groups.findIndex(
                            (grp) => grp.id === group_id
                        );
                        if (groupIndex !== -1) {
                            meeting.groups[groupIndex] = group;
                        }
                    }
                });

                // Update historicMeetings
                state.historicMeetings.forEach((meeting) => {
                    if (meeting.id === meeting_id) {
                        const groupIndex = meeting.groups.findIndex(
                            (grp) => grp.id === group_id
                        );
                        if (groupIndex !== -1) {
                            meeting.groups[groupIndex] = group;
                        }
                    }
                });

                // Update legacy meetings array (keeping existing logic for backward compatibility)
                const existingMeetings = state.meetings;
                const updatedMeetings = existingMeetings.map((mtg) => {
                    console.log('mtg.id:', mtg.id);
                    if (mtg.id === meeting_id) {
                        printObject('MS:319->payload:\n', action.payload);
                        printObject('MS:320->mtg:\n', mtg);
                        const existingGroups = mtg.groups;
                        const newGroups = existingGroups.map((grp) => {
                            if (grp.id === group_id) {
                                return group;
                            } else {
                                return grp;
                            }
                        });

                        const updatedMeeting = {
                            ...mtg,
                            groups: newGroups,
                        };
                        return updatedMeeting;
                    } else {
                        return mtg;
                    }
                });
                state.meetings = [...updatedMeetings];

                state.isLoading = false;
                return state;
            })
            .addCase(updateGroup.rejected, (state, action) => {
                printObject(
                    'MS:321-->updateGroup__REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(deleteGroupFromMeeting.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(deleteGroupFromMeeting.fulfilled, (state, action) => {
                state.activeMeetings.forEach((meeting) => {
                    const groupIndex = meeting?.groups.findIndex(
                        (group) => group?.id === action?.payload?.group_id
                    );
                    if (groupIndex !== -1) {
                        meeting?.groups.splice(groupIndex, 1);
                    }
                });

                state.historicMeetings.forEach((meeting) => {
                    const groupIndex = meeting?.groups.findIndex(
                        (group) => group?.id === action?.payload?.group_id
                    );
                    if (groupIndex !== -1) {
                        meeting?.groups?.splice(groupIndex, 1);
                    }
                });

                state.isLoading = false;
                return state;

                //* * * * * * * * * * * * * * * * * * * * *
                //*  remove the group from the meeting
                //* * * * * * * * * * * * * * * * * * * * *
                // const aMeetings = state.activeMeetings;
                // const hMeetings = state.historicMeetings;

                // function removeGroupFromMeeting(meetings, deleteThisGroup) {
                //     meetings.forEach((meeting) => {
                //         const groupIndex = meeting.groups.findIndex(
                //             (group) => group.id === deleteThisGroup.group_id
                //         );
                //         if (groupIndex !== -1) {
                //             meeting.groups.splice(groupIndex, 1);
                //         }
                //     });
                // }

                // removeGroupFromMeeting(aMeetings, action.payload);
                // removeGroupFromMeeting(hMeetings, action.payload);

                // return {
                //     ...state,
                //     activeMeetings: aMeetings,
                //     historicMeetings: hMeetings,
                //     isLoading: false,
                // };
            })
            .addCase(deleteGroupFromMeeting.rejected, (state, action) => {
                printObject(
                    'MS:336-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(addDefaultGroups.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addDefaultGroups.fulfilled, (state, action) => {
                // printObject(
                //     'MS:332-->addDefaultGroups.FULFILLED:action.payload:\n',
                //     action.payload
                // );
                //* * * * * * * * * * * * * * * * * * * * *
                //* this will receive the updated meeting
                //* * * * * * * * * * * * * * * * * * * * *
                const newMeetings = state.meetings.map((m) => {
                    if (m.id === action.payload.id) {
                        return action.payload;
                    } else {
                        return m;
                    }
                });
                state.meetings = newMeetings;

                state.isLoading = false;
                return state;
            })
            .addCase(addDefaultGroups.rejected, (state, action) => {
                printObject(
                    'MS:336-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(fetchMeetingDetailsById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchMeetingDetailsById.fulfilled, (state, action) => {
                //***************************************************
                //* a mtg could come in, and it might or might not
                //* be in our state.
                //***************************************************
                // printObject(
                //     '🟧🟧🟧 MS:440->action.payload:\n',
                //     action?.payload
                // );
                if (action.payload?.status === 200) {
                    // we have a successful response
                    const meeting = action.payload.data;
                    const updatedState = { ...state }; // Create a copy of the state
                    // const arrayToUpdate = meeting.is_active
                    //     ? updatedState.activeMeetings
                    //     : updatedState.historicMeetings;
                    // const updatedMeetingIndex = arrayToUpdate.findIndex(
                    //     (aMeeting) => aMeeting.meeting_id === meeting.meeting_id
                    // );
                    // if (updatedMeetingIndex !== -1) {
                    //     // Create a new array to hold the updated state
                    //     const updatedArray = [...arrayToUpdate];
                    //     updatedArray[updatedMeetingIndex] = meeting;

                    //     // Update the relevant state property with the new array
                    //     updatedState[
                    //         arrayToUpdate === updatedState.activeMeetings
                    //             ? 'activeMeetings'
                    //             : 'historicMeetings'
                    //     ] = updatedArray;
                    // }

                    // return updatedState; // Return the updated state object
                    return;
                }
            })
            .addCase(fetchMeetingDetailsById.rejected, (state, action) => {
                printObject(
                    'MS:471-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })

            .addCase(refreshActiveMeetings.pending, (state, action) => {
                state.isLoading = true;
            })
            .addCase(refreshActiveMeetings.fulfilled, (state, action) => {
                return {
                    ...state,
                    activeMeetings:
                        [...action.payload.meetingInfo.activeMeetings] || [],
                    activeCurrentPage:
                        action.payload.meetingInfo.activeCurrentPage || 0,
                    activeLastPage:
                        action.payload.meetingInfo.activeLastPage || 0,
                    isLoading: false,
                };
            })
            .addCase(refreshActiveMeetings.rejected, (state, action) => {
                printObject(
                    'MS:689-->fetchActiveMeetings.REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(loadHistoricPage.pending, (state, action) => {
                state.isLoading = true;
            })
            .addCase(loadHistoricPage.fulfilled, (state, action) => {
                // printObject(
                //     '🧽🧽🧽🧽 MS:733-->historic_current_page:',
                //     action.payload
                // );
                // printObject(
                //     '🍽️🍽️🍽️ MS:724-->action:payload:\n',
                //     action.payload
                // );
                if (action.payload.status === 200) {
                    const additionalMeetings = [];
                    // if (
                    //     state.historicMeetings.length > 0 &&
                    //     state.additionalMeetings.length > 0
                    // ) {
                    //     additionalMeetings = [
                    //         ...action.payload.additionalMeetings,
                    //     ];
                    // } else if (
                    //     state.historicMeetings.length > 0 &&
                    //     state.additionalHistoricMeetings.length === 0
                    // ) {
                    //     additionalMeetings = [
                    //         ...action.payload.additionalMeetings,
                    //     ];
                    // }
                    return {
                        ...state,
                        additionalHistoricMeetings: [
                            ...action.payload.additionalMeetings,
                        ],
                        historicMeetings: [
                            ...state.historicMeetings,
                            ...action.payload.additionalMeetings,
                        ],
                        historicCurrentPage: parseInt(
                            action.payload.historic_current_page
                        ), // Assuming this is the correct property name
                    };
                }
                // const existingMeetings = state.historicMeetings;
                // const additionalMeetings = action.payload.additionalMeetings;
                // const updatedMeetings = [
                //     ...existingMeetings,
                //     ...additionalMeetings,
                // ];
                // const returnValues = {
                //     ...state,
                //     historicMeetings: updatedMeetings,
                //     historicCurrentPage: action.payload.updatedHistoricPage,
                // };
            })
            .addCase(loadHistoricPage.rejected, (state, action) => {})
            .addCase(fetchAllMeetings.pending, (state, action) => {
                state.isLoading = true;
            })
            .addCase(fetchAllMeetings.fulfilled, (state, action) => {
                return {
                    ...state,
                    activeMeetings:
                        [...action.payload.meetingInfo.activeMeetings] || [],
                    activeCurrentPage:
                        action.payload.meetingInfo.activeCurrentPage || 0,
                    activeLastPage:
                        action.payload.meetingInfo.activeLastPage || 0,
                    historicMeetings:
                        [...action.payload.meetingInfo.historicMeetings] || [],
                    historicCurrentPage:
                        action.payload.meetingInfo.historicCurrentPage || 0,
                    historicLastPage:
                        action.payload.meetingInfo.historicLastPage || 0,
                    isLoading: false,
                };
            })

            .addCase(fetchAllMeetings.rejected, (state, action) => {
                printObject(
                    'MS:788 ->fetchAllMeetings.REJECTED:action:\n',
                    action
                );
                state.isLoading = false;
            })
            .addCase(saveCurrentMeetingAndGroups.pending, (state, action) => {
                state.isLoading = true;
            })
            .addCase(saveCurrentMeetingAndGroups.fulfilled, (state, action) => {
                state.currentMeeting = action.payload.currentMeeting;
                state.currentGroups = action.payload.currentGroups; // Direct assignment is safe due to Immer
                return state; // Return the mutated state
            })

            .addCase(saveCurrentMeetingAndGroups.rejected, (state, action) => {
                printObject('action:\n', action);
                printObject(
                    'MS:801 ->saveCurrentMeetingAndGroups.REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })

            .addCase(addMeetingLegacy.pending, (state, action) => {
                state.isLoading = true;
            })
            .addCase(addMeetingLegacy.fulfilled, (state, action) => {
                const meeting = action?.payload?.meetingDetails?.currentMeeting;
                console.log('addMeetingLegacy.fulfilled - meeting:', meeting);
                console.log(
                    'addMeetingLegacy.fulfilled - meeting_date:',
                    meeting?.meeting_date
                );

                function isMeetingDateBeforeToday(meetingDate) {
                    console.log('Input meetingDate:', meetingDate);
                    if (!meetingDate) {
                        console.log('No meeting date provided');
                        return false;
                    }
                    let datePart = meetingDate.split('-');
                    console.log('Date parts:', datePart);
                    //need to increment month
                    let mo = parseInt(datePart[1] - 1);
                    let mDate = new Date(
                        parseInt(datePart[0]),
                        mo,
                        parseInt(datePart[2])
                    );
                    let testDate = new Date(mDate.toDateString());
                    const today = new Date(new Date().toDateString());

                    console.log('Date comparison - testDate:', testDate);
                    console.log('Date comparison - today:', today);
                    console.log(
                        'Date comparison - is before today:',
                        testDate < today
                    );

                    return testDate < today;
                }
                const isHistoric = isMeetingDateBeforeToday(
                    meeting.meeting_date
                );

                console.log('isHistoric:', isHistoric);

                if (isHistoric) {
                    console.log('Adding to historic meetings');
                    //put new meeting in the historic array
                    const unsortedMeetings =
                        state.historicMeetings.concat(meeting);
                    unsortedMeetings.sort((a, b) => {
                        // Historic meetings should be sorted in descending order (newest first)
                        const sortedByMeetingDate =
                            b.meeting_date.localeCompare(a.meeting_date);
                        return sortedByMeetingDate;
                    });
                    state.historicMeetings = unsortedMeetings;
                    console.log(
                        'Historic meetings after add:',
                        state.historicMeetings.length
                    );
                } else {
                    console.log('Adding to active meetings');
                    //put new meeting in the active array
                    //* sort by meeting_date ascending
                    const unsortedMeetings =
                        state.activeMeetings.concat(meeting);
                    unsortedMeetings.sort((a, b) => {
                        const sortedByMeetingDate =
                            a.meeting_date.localeCompare(b.meeting_date);
                        return sortedByMeetingDate;
                    });
                    state.activeMeetings = unsortedMeetings;
                    console.log(
                        'Active meetings after add:',
                        state.activeMeetings.length
                    );
                }
                state.isLoading = false;
            })

            .addCase(addMeetingLegacy.rejected, (state, action) => {
                printObject(
                    'MS:813 ->addMeeting.REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(updateMeeting.pending, (state, action) => {
                state.isLoading = true;
            })
            .addCase(updateMeeting.fulfilled, (state, action) => {
                const meeting = action?.payload?.data;
                //* * * * * * * * * * * * * * * * * * * * *
                //* Check if meeting date should move it between lists
                //* * * * * * * * * * * * * * * * * * * * *
                function isMeetingDateBeforeToday(meetingDate) {
                    let datePart = meetingDate.split('-');
                    //need to increment month
                    let mo = parseInt(datePart[1] - 1);
                    let mDate = new Date(
                        parseInt(datePart[0]),
                        mo,
                        parseInt(datePart[2])
                    );
                    let testDate = new Date(mDate.toDateString());
                    return testDate < new Date(new Date().toDateString());
                }

                const isHistoric = isMeetingDateBeforeToday(
                    meeting.meeting_date
                );

                // Remove the meeting from both arrays first
                const activeWithoutMeeting = state.activeMeetings.filter(
                    (aMeeting) => aMeeting.id !== meeting.id
                );
                const historicWithoutMeeting = state.historicMeetings.filter(
                    (hMeeting) => hMeeting.id !== meeting.id
                );

                if (isHistoric) {
                    // Meeting should be in historic list
                    const updatedHistoric = [
                        ...historicWithoutMeeting,
                        meeting,
                    ];
                    updatedHistoric.sort(
                        (a, b) => b.meeting_date.localeCompare(a.meeting_date) // Descending order for historic
                    );

                    return {
                        ...state,
                        activeMeetings: activeWithoutMeeting,
                        historicMeetings: updatedHistoric,
                        isLoading: false,
                    };
                } else {
                    // Meeting should be in active list
                    const updatedActive = [...activeWithoutMeeting, meeting];
                    updatedActive.sort(
                        (a, b) => a.meeting_date.localeCompare(b.meeting_date) // Ascending order for active
                    );

                    return {
                        ...state,
                        activeMeetings: updatedActive,
                        historicMeetings: historicWithoutMeeting,
                        isLoading: false,
                    };
                }
            })

            .addCase(updateMeeting.rejected, (state, action) => {
                printObject(
                    'MS:857 ->updateMeeting.REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })

            // saveNewMeeting cases
            .addCase(saveNewMeeting.pending, (state, action) => {
                state.isLoading = true;
            })
            .addCase(saveNewMeeting.fulfilled, (state, action) => {
                console.log(
                    'saveNewMeeting.fulfilled - payload:',
                    action.payload
                );
                const meeting =
                    action.payload?.meetingDetails?.currentMeeting ||
                    action.payload;
                console.log('saveNewMeeting.fulfilled - meeting:', meeting);

                if (meeting && meeting.meeting_date) {
                    const isHistoric = isDateDashBeforeToday(
                        meeting.meeting_date
                    );
                    console.log(
                        'saveNewMeeting.fulfilled - isHistoric:',
                        isHistoric
                    );

                    if (isHistoric) {
                        console.log(
                            'saveNewMeeting.fulfilled - Adding to historic meetings'
                        );
                        const unsortedMeetings =
                            state.historicMeetings.concat(meeting);
                        unsortedMeetings.sort((a, b) => {
                            return b.meeting_date.localeCompare(a.meeting_date);
                        });
                        state.historicMeetings = unsortedMeetings;
                        console.log(
                            'saveNewMeeting.fulfilled - Historic meetings count:',
                            state.historicMeetings.length
                        );
                    } else {
                        console.log(
                            'saveNewMeeting.fulfilled - Adding to active meetings'
                        );
                        const unsortedMeetings =
                            state.activeMeetings.concat(meeting);
                        unsortedMeetings.sort((a, b) => {
                            return a.meeting_date.localeCompare(b.meeting_date);
                        });
                        state.activeMeetings = unsortedMeetings;
                        console.log(
                            'saveNewMeeting.fulfilled - Active meetings count:',
                            state.activeMeetings.length
                        );
                    }
                } else {
                    console.log(
                        'saveNewMeeting.fulfilled - No meeting or meeting_date, defaulting to active'
                    );
                    if (meeting) {
                        state.activeMeetings.push(meeting);
                    }
                }
                state.isLoading = false;
            })
            .addCase(saveNewMeeting.rejected, (state, action) => {
                console.log('saveNewMeeting.rejected - error:', action.error);
                state.isLoading = false;
            });
    },
});

// Action creators are generated for each case reducer function
export const {
    loadHistoricMeetings,
    loadMeetings,
    getMeetings,
    createTmp,
    updateTmp,
    loadGroups,
    deleteGroup,
    clearGroups,
    addNewGroup,
    addActiveMeeting,
    addANewMeeting,
    deleteAMeeting,
    getGroup,
    deleteCurrentMeetingAndGroups,
    // updateAMeeting,
    incrementHistoricCurrentPage,
    clearMeetingsSlice,
    logout,
} = meetingsSlice.actions;
export default meetingsSlice.reducer;
