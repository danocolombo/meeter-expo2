import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isDateDashBeforeToday, printObject } from '@utils/helpers';
import { FullGroup, FullMeeting } from '../../types/interfaces';
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

type MeetingsState = {
    meetings: FullMeeting[] | any[];
    activeMeetings: FullMeeting[] | any[];
    activeCurrentPage: number | string;
    activeLastPage: number | string;
    historicMeetings: FullMeeting[] | any[];
    additionalHistoricMeetings: FullMeeting[] | any[];
    historicCurrentPage: number | string;
    historicLastPage: number | string;
    specificMeeting: any;
    groups: FullGroup[] | any[];
    tmpMeeting: any;
    currentMeeting: any;
    currentGroups: any[];
    isLoading: boolean;
};

// helper omitted - kept logic in reducers where needed

function compareGroups(a: any, b: any) {
    const ga = (a.gender || '').toString();
    const gb = (b.gender || '').toString();
    if (ga < gb) return -1;
    if (ga > gb) return 1;

    const ta = (a.title || '').toString().toLowerCase();
    const tb = (b.title || '').toString().toLowerCase();
    if (ta < tb) return -1;
    if (ta > tb) return 1;

    const la = (a.location || '').toString().toLowerCase();
    const lb = (b.location || '').toString().toLowerCase();
    if (la < lb) return -1;
    if (la > lb) return 1;

    return 0;
}

const initialState: MeetingsState = {
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
        createTmp: (state, action: PayloadAction<any>) => {
            state.tmpMeeting = action.payload[0];
        },
        updateTmp: (state, action: PayloadAction<any>) => {
            state.tmpMeeting = Object.assign(state.tmpMeeting, action.payload);
        },
        loadMeetings: (state, action: PayloadAction<any[]>) => {
            state.meetings = action.payload;
        },
        loadGroups: (state, action: PayloadAction<any[]>) => {
            const wasGroups = action.payload;
            let newGroups: any[] = [];
            wasGroups.forEach((item) => newGroups.push(item));
            newGroups.sort(compareGroups);
            state.groups = newGroups;
        },
        // getGroup removed; selectors should be used instead of reducers for reading state
        addANewMeeting: (state, action: PayloadAction<any>) => {
            if (!state.meetings.find((m: any) => m.id === action.payload.id)) {
                state.meetings = [...state.meetings, action.payload];
            }
        },
        deleteAMeeting: (state, action: PayloadAction<any>) => {
            state.meetings = state.meetings.filter(
                (m: any) => m.id !== action.payload.id
            );
            state.isLoading = false;
        },
        deleteCurrentMeetingAndGroups: (state) => {
            state.currentMeeting = {};
            state.currentGroups = [];
        },
        deleteGroup: (state, action: PayloadAction<any>) => {
            state.groups = state.groups.filter(
                (m: any) => m.groupId !== action.payload.groupId
            );
        },
        clearGroups: (state) => {
            state.groups = [];
        },
        incrementHistoricCurrentPage: (state) => {
            state.historicCurrentPage =
                (Number(state.historicCurrentPage) || 0) + 1;
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
            state.activeCurrentPage = 0;
            state.activeLastPage = 0;
            state.historicMeetings = [];
            state.additionalHistoricMeetings = [];
            state.historicCurrentPage = 0;
            state.historicLastPage = 0;
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
            .addCase(deleteMeeting.fulfilled, (state, action: any) => {
                const meetingIdToDelete = action.payload.data.meeting_id;
                state.activeMeetings = state.activeMeetings.filter(
                    (mtg: any) => mtg.id !== meetingIdToDelete
                );
                state.historicMeetings = state.historicMeetings.filter(
                    (mtg: any) => mtg.id !== meetingIdToDelete
                );
                state.isLoading = false;
            })
            .addCase(deleteMeeting.rejected, (state, action: any) => {
                printObject(
                    'MS:219-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(getSpecificMeeting.fulfilled, (state, action: any) => {
                state.specificMeeting = action.payload;
                state.isLoading = false;
            })
            .addCase(getSpecificMeeting.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllMeetings.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllMeetings.fulfilled, (state, action: any) => {
                try {
                    if (action.payload.status === '200') {
                        state.meetings = [...action.payload.meetings.all];
                        state.isLoading = false;
                        return;
                    } else {
                        state.meetings = [];
                        state.isLoading = false;
                        return;
                    }
                } catch (error) {
                    printObject('MS:230-->error getting all meetings\n', error);
                }
                state.isLoading = false;
            })
            .addCase(getAllMeetings.rejected, (state, action: any) => {
                printObject(
                    'MS:219-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(addGroup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addGroup.fulfilled, (state: any, action: any) => {
                const groupId = action.payload?.group_id;
                const fullGroup =
                    action.payload?.group ||
                    action.payload?.data ||
                    action.payload;
                state.activeMeetings.forEach((meeting: any) => {
                    if (!meeting) return;
                    if (!Array.isArray(meeting.groups)) meeting.groups = [];
                    const hasObjects =
                        meeting.groups.length > 0 &&
                        typeof meeting.groups[0] === 'object';
                    if (hasObjects) {
                        const exists = meeting.groups.find(
                            (g: any) => g.id === groupId
                        );
                        if (!exists && fullGroup) {
                            meeting.groups.push(fullGroup);
                            meeting.groups.sort(compareGroups as any);
                        }
                    } else {
                        if (!meeting.groups.includes(groupId))
                            meeting.groups.push(groupId);
                    }
                });
                state.historicMeetings.forEach((meeting: any) => {
                    if (!meeting) return;
                    if (!Array.isArray(meeting.groups)) meeting.groups = [];
                    const hasObjects =
                        meeting.groups.length > 0 &&
                        typeof meeting.groups[0] === 'object';
                    if (hasObjects) {
                        const exists = meeting.groups.find(
                            (g: any) => g.id === groupId
                        );
                        if (!exists && fullGroup) {
                            meeting.groups.push(fullGroup);
                            meeting.groups.sort(compareGroups as any);
                        }
                    } else {
                        if (!meeting.groups.includes(groupId))
                            meeting.groups.push(groupId);
                    }
                });
                if (fullGroup) {
                    const exists = state.groups.find(
                        (g: any) => g.id === fullGroup.id
                    );
                    if (!exists) state.groups.push(fullGroup);
                    state.groups.sort(compareGroups as any);
                }
                state.isLoading = false;
            })
            .addCase(addGroup.rejected, (state, action: any) => {
                printObject(
                    '<MS:267></MS:267>-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(updateGroup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateGroup.fulfilled, (state: any, action: any) => {
                const group = action.payload;
                const meeting_id = group.meeting_id;
                const group_id = group.id;
                state.activeMeetings.forEach((meeting: any) => {
                    if (meeting.id === meeting_id) {
                        const groupIndex = meeting.groups.findIndex(
                            (grp: any) => grp.id === group_id
                        );
                        if (groupIndex !== -1) {
                            meeting.groups[groupIndex] = group;
                            if (
                                meeting.groups.length > 0 &&
                                typeof meeting.groups[0] === 'object'
                            )
                                meeting.groups.sort(compareGroups as any);
                        }
                    }
                });
                state.historicMeetings.forEach((meeting: any) => {
                    if (meeting.id === meeting_id) {
                        const groupIndex = meeting.groups.findIndex(
                            (grp: any) => grp.id === group_id
                        );
                        if (groupIndex !== -1) {
                            meeting.groups[groupIndex] = group;
                            if (
                                meeting.groups.length > 0 &&
                                typeof meeting.groups[0] === 'object'
                            )
                                meeting.groups.sort(compareGroups as any);
                        }
                    }
                });
                const existingMeetings = state.meetings;
                const updatedMeetings = existingMeetings.map((mtg: any) => {
                    if (mtg.id === meeting_id) {
                        const existingGroups = mtg.groups;
                        const newGroups = existingGroups.map((grp: any) =>
                            grp.id === group_id ? group : grp
                        );
                        if (
                            newGroups.length > 0 &&
                            typeof newGroups[0] === 'object'
                        )
                            newGroups.sort(compareGroups as any);
                        return { ...mtg, groups: newGroups };
                    } else {
                        return mtg;
                    }
                });
                state.meetings = [...updatedMeetings];
                if (Array.isArray(state.groups) && state.groups.length > 0) {
                    const topIndex = state.groups.findIndex(
                        (g: any) => g.id === group_id
                    );
                    if (topIndex !== -1) state.groups[topIndex] = group;
                    else state.groups.push(group);
                    state.groups.sort(compareGroups as any);
                }
                state.isLoading = false;
            })
            .addCase(updateGroup.rejected, (state, action: any) => {
                printObject(
                    'MS:321-->updateGroup__REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(deleteGroupFromMeeting.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(
                deleteGroupFromMeeting.fulfilled,
                (state: any, action: any) => {
                    state.activeMeetings.forEach((meeting: any) => {
                        const groupIndex = meeting?.groups.findIndex(
                            (group: any) =>
                                group?.id === action?.payload?.group_id
                        );
                        if (groupIndex !== -1)
                            meeting?.groups.splice(groupIndex, 1);
                    });
                    state.historicMeetings.forEach((meeting: any) => {
                        const groupIndex = meeting?.groups.findIndex(
                            (group: any) =>
                                group?.id === action?.payload?.group_id
                        );
                        if (groupIndex !== -1)
                            meeting?.groups?.splice(groupIndex, 1);
                    });
                    state.isLoading = false;
                }
            )
            .addCase(deleteGroupFromMeeting.rejected, (state, action: any) => {
                printObject(
                    'MS:336-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(addDefaultGroups.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addDefaultGroups.fulfilled, (state: any, action: any) => {
                const newMeetings = state.meetings.map((m: any) =>
                    m.id === action.payload.id ? action.payload : m
                );
                state.meetings = newMeetings;
                state.isLoading = false;
            })
            .addCase(addDefaultGroups.rejected, (state, action: any) => {
                printObject(
                    'MS:336-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(fetchMeetingDetailsById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(
                fetchMeetingDetailsById.fulfilled,
                (state: any, action: any) => {
                    if (action.payload?.status === 200) {
                        // no-op (original code returned early)
                        return;
                    }
                }
            )
            .addCase(fetchMeetingDetailsById.rejected, (state, action: any) => {
                printObject(
                    'MS:471-->REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(refreshActiveMeetings.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(
                refreshActiveMeetings.fulfilled,
                (state: any, action: any) => {
                    state.activeMeetings = (action.payload?.meetingInfo
                        ?.activeMeetings ?? []) as any[];
                    state.activeCurrentPage =
                        action.payload?.meetingInfo?.activeCurrentPage ?? 0;
                    state.activeLastPage =
                        action.payload?.meetingInfo?.activeLastPage ?? 0;
                    state.isLoading = false;
                }
            )
            .addCase(refreshActiveMeetings.rejected, (state, action: any) => {
                printObject(
                    'MS:689-->fetchActiveMeetings.REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(loadHistoricPage.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loadHistoricPage.fulfilled, (state: any, action: any) => {
                if (action.payload.status === 200) {
                    state.additionalHistoricMeetings = [
                        ...action.payload.additionalMeetings,
                    ];
                    state.historicMeetings = [
                        ...state.historicMeetings,
                        ...action.payload.additionalMeetings,
                    ];
                    state.historicCurrentPage = parseInt(
                        action.payload.historic_current_page
                    );
                }
            })
            .addCase(loadHistoricPage.rejected, () => {})
            .addCase(fetchAllMeetings.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllMeetings.fulfilled, (state: any, action: any) => {
                state.activeMeetings = (action.payload?.meetingInfo
                    ?.activeMeetings ?? []) as any[];
                state.activeCurrentPage =
                    action.payload?.meetingInfo?.activeCurrentPage ?? 0;
                state.activeLastPage =
                    action.payload?.meetingInfo?.activeLastPage ?? 0;
                state.historicMeetings = (action.payload?.meetingInfo
                    ?.historicMeetings ?? []) as any[];
                state.historicCurrentPage =
                    action.payload?.meetingInfo?.historicCurrentPage ?? 0;
                state.historicLastPage =
                    action.payload?.meetingInfo?.historicLastPage ?? 0;
                state.isLoading = false;
            })
            .addCase(fetchAllMeetings.rejected, (state: any, action: any) => {
                printObject(
                    'MS:788 ->fetchAllMeetings.REJECTED:action:\n',
                    action
                );
                state.isLoading = false;
            })
            .addCase(saveCurrentMeetingAndGroups.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(
                saveCurrentMeetingAndGroups.fulfilled,
                (state: any, action: any) => {
                    state.currentMeeting = action.payload.currentMeeting;
                    state.currentGroups = action.payload.currentGroups;
                    return state;
                }
            )
            .addCase(
                saveCurrentMeetingAndGroups.rejected,
                (state: any, action: any) => {
                    printObject('action:\n', action);
                    printObject(
                        'MS:801 ->saveCurrentMeetingAndGroups.REJECTED:action.payload:\n',
                        action.payload
                    );
                    state.isLoading = false;
                }
            )
            .addCase(addMeetingLegacy.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addMeetingLegacy.fulfilled, (state: any, action: any) => {
                const meeting = action?.payload?.meetingDetails?.currentMeeting;
                if (!meeting) return;
                function isMeetingDateBeforeToday(meetingDate: string) {
                    if (!meetingDate) return false;
                    const datePart = meetingDate.split('-');
                    const mo = parseInt(datePart[1]) - 1;
                    const mDate = new Date(
                        parseInt(datePart[0]),
                        mo,
                        parseInt(datePart[2])
                    );
                    const testDate = new Date(mDate.toDateString());
                    const today = new Date(new Date().toDateString());
                    return testDate < today;
                }
                const isHistoric = isMeetingDateBeforeToday(
                    meeting.meeting_date
                );
                if (isHistoric) {
                    const unsortedMeetings =
                        state.historicMeetings.concat(meeting);
                    unsortedMeetings.sort((a: any, b: any) =>
                        b.meeting_date.localeCompare(a.meeting_date)
                    );
                    state.historicMeetings = unsortedMeetings;
                } else {
                    const unsortedMeetings =
                        state.activeMeetings.concat(meeting);
                    unsortedMeetings.sort((a: any, b: any) =>
                        a.meeting_date.localeCompare(b.meeting_date)
                    );
                    state.activeMeetings = unsortedMeetings;
                }
                state.isLoading = false;
            })
            .addCase(addMeetingLegacy.rejected, (state: any, action: any) => {
                printObject(
                    'MS:813 ->addMeeting.REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(updateMeeting.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateMeeting.fulfilled, (state: any, action: any) => {
                const meeting = action?.payload?.data;
                if (!meeting) return;
                function isMeetingDateBeforeToday(meetingDate: string) {
                    const datePart = meetingDate.split('-');
                    const mo = parseInt(datePart[1]) - 1;
                    const mDate = new Date(
                        parseInt(datePart[0]),
                        mo,
                        parseInt(datePart[2])
                    );
                    const testDate = new Date(mDate.toDateString());
                    return testDate < new Date(new Date().toDateString());
                }
                const isHistoric = isMeetingDateBeforeToday(
                    meeting.meeting_date
                );
                const activeWithoutMeeting = state.activeMeetings.filter(
                    (aMeeting: any) => aMeeting.id !== meeting.id
                );
                const historicWithoutMeeting = state.historicMeetings.filter(
                    (hMeeting: any) => hMeeting.id !== meeting.id
                );
                if (isHistoric) {
                    const updatedHistoric = [
                        ...historicWithoutMeeting,
                        meeting,
                    ];
                    updatedHistoric.sort((a: any, b: any) =>
                        b.meeting_date.localeCompare(a.meeting_date)
                    );
                    state.activeMeetings = activeWithoutMeeting;
                    state.historicMeetings = updatedHistoric;
                    state.isLoading = false;
                } else {
                    const updatedActive = [...activeWithoutMeeting, meeting];
                    updatedActive.sort((a: any, b: any) =>
                        a.meeting_date.localeCompare(b.meeting_date)
                    );
                    state.activeMeetings = updatedActive;
                    state.historicMeetings = historicWithoutMeeting;
                    state.isLoading = false;
                }
            })
            .addCase(updateMeeting.rejected, (state: any, action: any) => {
                printObject(
                    'MS:857 ->updateMeeting.REJECTED:action.payload:\n',
                    action.payload
                );
                state.isLoading = false;
            })
            .addCase(saveNewMeeting.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(saveNewMeeting.fulfilled, (state: any, action: any) => {
                const meeting =
                    action.payload?.meetingDetails?.currentMeeting ||
                    action.payload;
                if (meeting && meeting.meeting_date) {
                    const isHistoric = isDateDashBeforeToday(
                        meeting.meeting_date
                    );
                    if (isHistoric) {
                        const unsortedMeetings =
                            state.historicMeetings.concat(meeting);
                        unsortedMeetings.sort((a: any, b: any) =>
                            b.meeting_date.localeCompare(a.meeting_date)
                        );
                        state.historicMeetings = unsortedMeetings;
                    } else {
                        const unsortedMeetings =
                            state.activeMeetings.concat(meeting);
                        unsortedMeetings.sort((a: any, b: any) =>
                            a.meeting_date.localeCompare(b.meeting_date)
                        );
                        state.activeMeetings = unsortedMeetings;
                    }
                } else {
                    if (meeting) state.activeMeetings.push(meeting);
                }
                state.isLoading = false;
            })
            .addCase(saveNewMeeting.rejected, (state: any, action: any) => {
                console.log('saveNewMeeting.rejected - error:', action.error);
                state.isLoading = false;
            });
    },
});

export const {
    loadMeetings,
    createTmp,
    updateTmp,
    loadGroups,
    deleteGroup,
    clearGroups,
    addANewMeeting,
    deleteAMeeting,
    deleteCurrentMeetingAndGroups,
    incrementHistoricCurrentPage,
    clearMeetingsSlice,
    logout,
} = meetingsSlice.actions;

export default meetingsSlice.reducer;
