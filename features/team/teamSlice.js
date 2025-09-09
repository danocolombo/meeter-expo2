import { createSlice } from '@reduxjs/toolkit';
import {
    loadTeam,
    deactivateMember,
    activateMember,
    updateActiveMember,
    acceptMember,
    declineMember,
    loadOrgUsers,
} from './teamThunks';
import { printObject } from '../../utils/helpers';

const initialState = {
    activeMembers: [],
    inactiveMembers: [],
    newMembers: [],
    allMembers: [],
    isLoading: false,
};

const teamSlice = createSlice({
    name: 'team',
    initialState,
    reducers: {
        loadActiveTeam: (state, action) => {
            state.activeMembers = action.payload;
        },
        loadNewTeam: (state, action) => {
            state.newMembers = action.payload;
        },
        loadInactiveTeam: (state, action) => {
            state.inactiveMembers = action.payload;
        },
        addNewTeamAffiliation: (state, action) => {
            console.log('TS:35-->action.payload:\n', action?.payload);
            const allTeam = state.allMembers;
            const userIndex = allTeam.findIndex(
                (user) => user.id === action.payload.userId
            );
            if (userIndex !== -1) {
                // user found, check if the affiliation already exists
                const user = allTeam[userIndex];
                const existingAffiliationIndex = user.affiliations.findIndex(
                    (affiliation) => affiliation.id === action.payload.id
                );
                if (existingAffiliationIndex === -1) {
                    //Add the new affiliation to the user's affiliations array
                    user.affiliations.push({
                        id: action?.payload?.id,
                        role: action?.payload?.role,
                        status: action?.payload?.status,
                        organizationAffiliationsId:
                            action?.payload?.organizationAffiliationsId,
                    });
                }
                printObject('user updated:\n', user);
                allTeam[userIndex] = user;
            }
        },
        removeTeamAffiliation: (state, action) => {
            console.log('TS:38-->action.payload:\n', action?.payload);
        },
        clearAllMembers: (state) => {
            state.activeMembers = [];
            state.inactiveMembers = [];
            state.newMembers = [];
        },
        clearTeamSlice: (state) => {
            state.activeMembers = [];
            state.inactiveMembers = [];
            state.newMembers = [];
            state.allMembers = [];
        },
        logout: (state) => {
            state.activeMembers = [];
            state.inactiveMembers = [];
            state.newMembers = [];
            state.allMembers = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadTeam.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loadTeam.fulfilled, (state, action) => {
                // printObject('TS:43-->action.payload:\n', action.payload);
                state.isLoading = false;
                // state.allMembers = action.payload.team;
                // state.activeMembers = action.payload.actives;
                // state.inactiveMembers = action.payload.inactives;
                // state.newMembers = action.payload.newMembers;
                state.activeMembers = action.payload.active;
                state.inactiveMembers = action.payload.inactive;
                state.newMembers = action.payload.new;
                state.allMembers = action.payload.all;
                return state;
            })
            .addCase(loadTeam.rejected, (state, action) => {
                console.log(action);
                state.isLoading = false;
            })
            .addCase(updateActiveMember.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateActiveMember.fulfilled, (state, action) => {
                //* * * * * * * * * * * * * * * * * * *
                //* This reducer does the following actions
                //*
                //* 1. update member in activeMembers
                //* 2. update member in allMembers
                //*
                //* * * * * * * * * * * * * * * * * * *
                const updatedMembers = state.activeMembers.map((member) => {
                    if (member.id === action.payload.id) {
                        return action.payload; // Replace the member with the updated payload
                    }
                    return member; // Keep other members unchanged
                });

                return {
                    ...state,
                    activeMembers: updatedMembers,
                    isLoading: false,
                };
            })
            .addCase(updateActiveMember.rejected, (state, action) => {
                console.log(action);
                state.isLoading = false;
            })
            .addCase(activateMember.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(activateMember.fulfilled, (state, action) => {
                //* * * * * * * * * * * * * * * * * * *
                //* This reducer does the following actions
                //*
                //* 1. add member to activeMembers
                //* 2. remove member from inactiveMembers
                //* 3. update allMembers
                //*
                //* * * * * * * * * * * * * * * * * * *
                //      1. add member to activeMembers
                const newActives = [...state.activeMembers, action.payload];
                state.activeMembers = newActives;
                //      2 remove member from inactiveMembers
                const newInactives = state.inactiveMembers.filter(
                    (member) => member.id !== action.payload.id
                );
                state.inactiveMembers = newInactives;
                //      3. update allMembers
                const updatedMembers = state.allMembers.map((m) => {
                    if (m.id === action.payload.id) {
                        return action.payload;
                    }
                    return m;
                });
                state.allMembers = updatedMembers;
                state.isLoading = false;
            })
            .addCase(activateMember.rejected, (state, action) => {
                console.log(action);
                state.isLoading = false;
            })
            .addCase(deactivateMember.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deactivateMember.fulfilled, (state, action) => {
                //* * * * * * * * * * * * * * * * * * *
                //* This reducer does the following actions
                //*
                //* 1. remove member from activeMembers
                //* 2. add member to inactiveMembers
                //* 3. update allMembers
                //*
                //* * * * * * * * * * * * * * * * * * *
                //      1 remove member from activeMembers
                const newActives = state.activeMembers.filter(
                    (member) => member.id !== action.payload.id
                );
                state.activeMembers = newActives;

                //      2. add member to inactiveMembers
                const newInactives = [...state.inactiveMembers, action.payload];
                state.inactiveMembers = newInactives;

                //      3. update allMembers
                const updatedMembers = state.allMembers.map((m) => {
                    if (m.id === action.payload.id) {
                        return action.payload;
                    }
                    return m;
                });
                state.allMembers = updatedMembers;
                state.isLoading = false;
            })
            .addCase(deactivateMember.rejected, (state, action) => {
                console.log(action);
                state.isLoading = false;
            })

            .addCase(acceptMember.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(acceptMember.fulfilled, (state, action) => {
                //* * * * * * * * * * * * * * * * * * *
                //* This reducer does the following actions
                //*
                //* 1. remove member from newMembers
                //* 2. add member to activeMembers
                //* 3. update allMembers
                //*
                //* * * * * * * * * * * * * * * * * * *
                const newUpdates = state.newMembers.filter(
                    (member) => member.id !== action.payload.id
                );
                state.newMembers = newUpdates;
                printObject('TS:173-->newMembers result:\n', state.newMembers);
                //      2. add member to activeMembers
                const newActives = [...state.activeMembers, action.payload];
                state.activeMembers = newActives;
                //      3. update allMembers
                const updatedMembers = state.allMembers.map((m) => {
                    if (m.id === action.payload.id) {
                        return action.payload;
                    }
                    return m;
                });
                state.allMembers = updatedMembers;
                state.isLoading = false;
            })
            .addCase(acceptMember.rejected, (state, action) => {
                console.log(action);
                state.isLoading = false;
            })
            .addCase(declineMember.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(declineMember.fulfilled, (state, action) => {
                //* * * * * * * * * * * * * * * * * * *
                //* This reducer does the following actions
                //*
                //* 1. removes member from newMembers
                //* 2. removes member from allMembers
                //*
                //* * * * * * * * * * * * * * * * * * *
                //      1. remove member from  newMembers
                const newUpdates = state.newMembers.filter(
                    (member) => member.id !== action.payload.id
                );
                state.newMembers = newUpdates;

                //      2. remove member from  allMembers
                const allUpdates = state.allMembers.filter(
                    (member) => member.id !== action.payload.id
                );
                state.allMembers = allUpdates;
                state.isLoading = false;
            })
            .addCase(declineMember.rejected, (state, action) => {
                console.log(action);
                state.isLoading = false;
            })
            .addCase(loadOrgUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loadOrgUsers.fulfilled, (state, action) => {
                // printObject('TS:225-->action.payload:\n', action.payload);
                const sortedActiveMembers = action.payload.active.sort(
                    (a, b) => {
                        if (a.lastName !== b.lastName) {
                            return a.lastName.localeCompare(b.lastName);
                        }
                        return a.firstName.localeCompare(b.firstName);
                    }
                );

                const sortedInactiveMembers = action.payload.inactive.sort(
                    (a, b) => {
                        if (a.lastName !== b.lastName) {
                            return a.lastName.localeCompare(b.lastName);
                        }
                        return a.firstName.localeCompare(b.firstName);
                    }
                );

                const sortedNewMembers = action.payload.requests.sort(
                    (a, b) => {
                        if (a.lastName !== b.lastName) {
                            return a.lastName.localeCompare(b.lastName);
                        }
                        return a.firstName.localeCompare(b.firstName);
                    }
                );
                state.activeMembers = sortedActiveMembers;
                state.inactiveMembers = sortedInactiveMembers;
                state.newMembers = sortedNewMembers;
                state.isLoading = false;
                // state.allMembers = action.payload.team;
                // state.activeMembers = action.payload.actives;
                // state.inactiveMembers = action.payload.inactives;
                // state.newMembers = action.payload.newMembers;
                return state;
            })
            .addCase(loadOrgUsers.rejected, (state, action) => {
                console.log('TS:234--rejected');
                state.isLoading = false;
            });
    },
});

export const {
    loadActiveTeam,
    loadNewTeam,
    loadInactiveTeam,
    addNewTeamAffiliation,
    removeTeamAffiliation,
    clearAllMembers,
    clearTeamSlice,
    logout,
} = teamSlice.actions;

export default teamSlice.reducer;
