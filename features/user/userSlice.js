import { createSlice } from '@reduxjs/toolkit';
import { printObject } from '@utils/helpers';
import {
    changeActiveOrg,
    changeOrg,
    errorTest,
    loginUser,
    saveHeroMessage,
    saveUserProfile,
    updateActiveOrgPermissions,
    updatePermissions,
} from './userThunks';

const initialState = {
    profile: {},
    apiToken: '',
    isAuthenticated: false,
    isLoading: false,
    isLimitedUser: false,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        addNewAffiliation: (state, action) => {
            // const theProfile = state.profile;
            // printObject('US:32->theProfile:\n', theProfile);
            return state;
        },
        addNewUserAffiliation: (state, action) => {
            console.log('US:36-->action.payload:\n', action?.payload);
            const currentUserId = state.profile.id;
            console.log('currentUserId:', currentUserId);
            if (currentUserId === action.payload.userId) {
                console.log('currentUser');
            } else {
                console.log('not currentUser');
            }
        },
        removeUserAffiliation: (state, action) => {
            console.log('US:39-->action.payload:\n', action?.payload);
        },
        clearUser: (state) => {
            state.profile = {};
            return state;
        },
        setAPIToken: (state, action) => {
            const token = action.payload;
            return {
                ...state,
                apiToken: token,
                isLoading: false,
            };
        },
        logout: (state) => {
            state.profile = {};
            state.isLimitedUser = false;
            state.isAuthenticated = false;
            state.apiToken = '';
            return state;
        },
        updateProfile: (state, action) => {
            // Allow setting isLoading directly if provided
            if (typeof action.payload.isLoading === 'boolean') {
                state.isLoading = action.payload.isLoading;
            }
            if (action.payload.preserveAuth) {
                // Only update the profile, preserve apiToken and perms
                state.profile = {
                    ...state.profile,
                    ...action.payload.profile,
                };
                state.isAuthenticated = true;
            } else if (action.payload.profile) {
                // Standard profile update
                state.profile = action.payload.profile;
            }
        },
        setUserOrganizations: (state, action) => {
            // Store sorted organizations in user profile
            const organizations = action.payload;
            // Sort organizations alphabetically in descending order (Z to A)
            const sortedOrganizations = [...organizations].sort((a, b) =>
                String(b?.name || '').localeCompare(String(a?.name || ''))
            );

            state.profile = {
                ...state.profile,
                organizations: sortedOrganizations,
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(saveUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(saveUserProfile.fulfilled, (state, action) => {
                // Set a default state update for testing
                printObject(
                    '🟨 🟨 🟨 US:92->saveUserProfile::action:\n',
                    action
                );
                // state.profile = action.payload.userProfile;
                // state.perms = action.payload.perms;
                // apiToken = action.payload.apiToken;
                // Merge the updated profile with existing profile to preserve all fields
                state.profile = {
                    ...state.profile, // Keep existing profile data
                    ...action.payload.userProfile, // Overlay with updated data
                };
                state.isAuthenticated = true; // Assume user is authenticated after profile save
                state.apiToken = action.payload.apiToken || state.apiToken; // Preserve existing token if none provided
                state.isLoading = false;
            })
            .addCase(saveUserProfile.rejected, (state, action) => {
                state.isLoading = false;
            })
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                if (action?.payload?.profile) {
                    return {
                        ...state,
                        ...action.payload, // This will set profile, apiToken, isAuthenticated, isLoading, isLimitedUser
                    };
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
            })
            .addCase(errorTest.pending, (state) => {
                console.log('US:89 errorTest.pending');
                state.isLoading = true;
                return state;
            })
            .addCase(errorTest.fulfilled, (state, action) => {
                console.log('US:99-->fulfilled.');
                console.log(action);
                state.isLoading = false;
                return state;
            })
            .addCase(errorTest.rejected, (state, action) => {
                console.log('US:99 errorTest.rejected');
                state.isLoading = false;
                state.error = action.error.message; // Access the error message
            })
            .addCase(changeOrg.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(changeOrg.fulfilled, (state, action) => {
                state.profile = action.payload.profile;
                state.isLoading = false;
                return state;
            })
            .addCase(changeOrg.rejected, (state, action) => {
                state.isLoading = false;
            })
            .addCase(updatePermissions.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updatePermissions.fulfilled, (state, action) => {
                // Permissions are now part of the profile object
                if (state.profile) {
                    state.profile.permissions = action.payload;
                }
                state.isLoading = false;
                return state;
            })
            .addCase(updatePermissions.rejected, (state, action) => {
                state.isLoading = false;
            })
            .addCase(changeActiveOrg.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(changeActiveOrg.fulfilled, (state, action) => {
                printObject(
                    'US:changeActiveOrg-->action.payload:\n',
                    action.payload
                );
                const profile = action.payload.userProfile;
                console.log(
                    '🔄 US:changeActiveOrg-->New permissions in profile:',
                    profile.permissions
                );
                console.log(
                    '🔄 US:changeActiveOrg-->New activeOrg:',
                    profile.activeOrg?.name
                );

                return {
                    ...state,
                    profile: profile,
                    isLoading: false,
                };
            })
            .addCase(changeActiveOrg.rejected, (state, action) => {
                state.isLoading = false;
            })

            .addCase(saveHeroMessage.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(saveHeroMessage.fulfilled, (state, action) => {
                const orgActiveOrg = state.profile.activeOrg;

                const newActiveOrg = {
                    ...orgActiveOrg,
                    heroMessage: action.payload.data.hero_message,
                };
                const updatedProfile = {
                    ...state.profile,
                    activeOrg: newActiveOrg,
                };

                return {
                    ...state,
                    profile: updatedProfile,
                    isLoading: false,
                };
            })
            .addCase(saveHeroMessage.rejected, (state, action) => {
                state.isLoading = false;
            })
            .addCase(updateActiveOrgPermissions.fulfilled, (state, action) => {
                if (state.profile) {
                    state.profile.permissions = action.payload;
                }
            });
    },
});

// Action creators are generated for each case reducer function
export const {
    addNewAffiliation,
    addNewUserAffiliation,
    removeUserAffiliation,
    setAPIToken,
    logout,
    clearUser,
    updateProfile,
    setUserOrganizations,
} = userSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export default userSlice.reducer;
