import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
    getGroupsForMeeting,
    saveNewGroup,
    loadDefaultGroups,
    createDefaultGroup,
    updateDefaultGroup,
    deleteDefaultGroup,
} from './groupsThunks';
import { printObject } from '../../utils/helpers';

const initialState = {
    groups: [],
    defaultGroups: [],
    isLoading: false,
    lastSortConfig: null, // Track last sort configuration for memoization
};

/**
 * Enhanced function to sort an array of groups
 * @param {Array} groups - The groups to sort
 * @param {Object} options - Sorting options
 * @param {string[]} options.sortOrder - Array of fields to sort by in priority order: ['gender', 'title', 'location']
 * @param {Object} options.direction - Direction for each field ('asc' or 'desc')
 * @returns {Array} - Sorted array of groups
 */
const sortGroups = (groups, options = {}) => {
    try {
        // Validate input
        if (!groups || !Array.isArray(groups) || groups.length === 0) {
            return [];
        }

        // Default sort configuration
        const sortOrder = options.sortOrder || ['gender', 'title', 'location'];
        const direction = options.direction || {
            gender: 'asc',
            title: 'asc',
            location: 'asc',
        };

        // Check if we have the same groups and sort config as last time
        if (
            initialState.lastSortConfig &&
            JSON.stringify(initialState.lastSortConfig.groups) ===
                JSON.stringify(groups) &&
            JSON.stringify(initialState.lastSortConfig.options) ===
                JSON.stringify(options)
        ) {
            return initialState.lastSortConfig.result;
        }

        // Create a copy to avoid mutating the original array
        const sortedGroups = [...groups].sort((a, b) => {
            if (!a || !b) return 0;

            // Sort by each field in order of priority
            for (const field of sortOrder) {
                if (!a[field] || !b[field]) continue;

                if (a[field] !== b[field]) {
                    const directionMultiplier =
                        direction[field] === 'desc' ? -1 : 1;
                    return (
                        a[field].localeCompare(b[field]) * directionMultiplier
                    );
                }
            }
            return 0;
        });

        // Store the result for potential reuse (memoization)
        initialState.lastSortConfig = {
            groups: JSON.parse(JSON.stringify(groups)),
            options,
            result: sortedGroups,
        };

        return sortedGroups;
    } catch (error) {
        console.log('🔴 GS:32 ->CatchError during sort:', error.message);
        printObject('error details:\n', error);
        return []; // Return empty array if sort fails
    }
};

const groupsSlice = createSlice({
    name: 'groups',
    initialState,
    reducers: {
        clearGroups: (state, action) => {
            state.groups = [];
            state.defaultGroups = [];
        },
        clearGroupSlice: (state) => {
            state.groups = [];
            state.defaultGroups = [];
        },
        logout: (state) => {
            state.groups = [];
            state.defaultGroups = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateDefaultGroup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateDefaultGroup.fulfilled, (state, action) => {
                try {
                    const index = state.defaultGroups?.findIndex(
                        (group) => group.id === action.payload.id
                    );
                    if (index !== -1) {
                        state.defaultGroups[index] = action.payload;
                    }
                } catch (error) {
                    console.log(
                        'hiccup while updating defaultGroups in groupSlice'
                    );
                    console.log(error);
                }
                try {
                    if (state.defaultGroups) {
                        state.defaultGroups = sortGroups(state.defaultGroups);
                    } else {
                        state.defaultGroups = [];
                    }
                } catch (error) {
                    console.log(
                        '🔴🔴🔴 GS:86 - Error sorting defaultGroups:',
                        error
                    );
                }
                printObject('GS:91->defaultGroups:\n', state.defaultGroups);
                state.isLoading = false;
            })
            .addCase(updateDefaultGroup.rejected, (state, action) => {
                printObject('GS:82-->action:\n', action);
                state.isLoading = false;
            })
            .addCase(getGroupsForMeeting.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getGroupsForMeeting.fulfilled, (state, action) => {
                // printObject('GS:43-->action.payload:\n', action.payload);
                state.isLoading = false;
                state.groups = action.payload;
            })
            .addCase(getGroupsForMeeting.rejected, (state, action) => {
                console.log(action);
                state.isLoading = false;
            })
            .addCase(deleteDefaultGroup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteDefaultGroup.fulfilled, (state, action) => {
                // printObject('GS:43-->action.payload:\n', action.payload);
                try {
                    const updatedDefaultGroups = state.defaultGroups.filter(
                        (group) => {
                            if (group.id !== action.payload) {
                                return group;
                            }
                        }
                    );
                    if (updatedDefaultGroups) {
                        state.defaultGroups = sortGroups(updatedDefaultGroups);
                    } else {
                        state.defaultGroups = [];
                    }
                } catch (error) {
                    printObject(
                        'GS:58-->error defining reduced array of default groups.\n',
                        error
                    );
                }
                state.isLoading = false;
            })
            .addCase(deleteDefaultGroup.rejected, (state, action) => {
                console.log(action);
                state.isLoading = false;
            })
            .addCase(loadDefaultGroups.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loadDefaultGroups.fulfilled, (state, action) => {
                const groups = action.payload.groups;
                if (groups) {
                    const sortedGroups = sortGroups(groups);
                    return {
                        ...state,
                        defaultGroups: sortedGroups,
                        isLoading: false,
                    };
                } else {
                    return {
                        ...state,
                        defaultGroups: [],
                        isLoading: false,
                    };
                }
            })
            .addCase(loadDefaultGroups.rejected, (state, action) => {
                console.log(action);
                state.isLoading = false;
            })
            .addCase(createDefaultGroup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createDefaultGroup.fulfilled, (state, action) => {
                const originalGroups = state.defaultGroups;
                originalGroups.push(action.payload);
                const sortGrps = (groups) => {
                    try {
                        return groups.sort((a, b) => {
                            if (a.gender !== b.gender) {
                                return a.gender.localeCompare(b.gender);
                            }

                            if (a.title !== b.title) {
                                return a.title.localeCompare(b.title);
                            }

                            return a.location.localeCompare(b.location);
                        });
                    } catch (error) {
                        console.log('🔴 GS:160 ->CatchError during sort');
                        printObject('error:\n', error);
                    }
                };
                if (originalGroups) {
                    const groups = sortGrps(originalGroups);
                    state.defaultGroups = [...groups];
                } else {
                    state.defaultGroups = [];
                }
                isLoading = false;
                return;
            })
            .addCase(createDefaultGroup.rejected, (state, action) => {
                console.log(action);
                state.isLoading = false;
            });
        // .addCase(saveNewGroup.pending, (state) => {
        //     state.isLoading = true;
        // })
        // .addCase(saveNewGroup.fulfilled, (state, action) => {
        //     // printObject('TS:43-->action.payload:\n', action.payload);
        //     const updatedGroups = [...state.groups, action.payload];

        //     state.isLoading = false;
        //     state.groups = sortGroups(updatedGroups);
        // })
        // .addCase(saveNewGroup.rejected, (state, action) => {
        //     console.log(action);
        //     state.isLoading = false;
        // });
    },
});

export const { clearGroups, clearGroupSlice, logout } = groupsSlice.actions;

export default groupsSlice.reducer;
