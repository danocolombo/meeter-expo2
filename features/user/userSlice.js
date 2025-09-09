import { createAction, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
    printObject,
    getToday,
    getPateDate,
    getDateMinusDays,
    isDateDashBeforeToday,
} from '../../utils/helpers';
import {
    saveUserProfile,
    loginUser,
    joinOrganization,
    changeDefaultOrg,
    updatePermissions,
    saveHeroMessage,
    changeOrg,
    errorTest,
    changeActiveOrg,
} from './userThunks';

const initialState = {
    profile: {},
    apiToken: '',
    isLoading: false,
    isLimitedUser: false,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        addNewAffiliation: (state, action) => {
            const theProfile = state.profile;
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
            return state;
        },
        updateProfile: (state, action) => {
            // Update profile while preserving authentication state
            if (action.payload.preserveAuth) {
                // Only update the profile, preserve apiToken and perms
                state.profile = {
                    ...state.profile,
                    ...action.payload.profile,
                };
            } else {
                // Standard profile update
                state.profile = action.payload.profile;
            }
        },
        setUserOrganizations: (state, action) => {
            // Store sorted organizations in user profile
            const organizations = action.payload;
            // Sort organizations alphabetically in descending order (Z to A)
            const sortedOrganizations = [...organizations].sort((a, b) =>
                b.name.localeCompare(a.name)
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
                    '🟨 🟨 🟨 US:75->saveUserProfile::action:\n',
                    action
                );
                // Merge the updated profile with existing profile to preserve all fields
                state.profile = {
                    ...state.profile, // Keep existing profile data
                    ...action.payload.userProfile, // Overlay with updated data
                };
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
                // Set a default state update for testing
                // printObject('🟨 🟨 🟨 US:95->loginUser::action:\n', action);
                // printObject('🔄 🔄 apiToken: ', action?.payload?.apiToken);
                if (
                    action?.payload?.profile?.id ||
                    action?.payload?.isLimitedUser
                ) {
                    return {
                        ...state,
                        profile: action.payload.profile,
                        apiToken: action.payload.apiToken,
                        isLimitedUser: action.payload.isLimitedUser || false,
                        isLoading: false,
                    };
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
            })
            .addCase(joinOrganization.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(joinOrganization.fulfilled, (state, action) => {
                state.profile = action.payload.userProfile;
                // printObject('US:82-->action.payload:\n', action.payload);
                state.isLoading = false;
                return state;
            })
            .addCase(joinOrganization.rejected, (state, action) => {
                console.log('US:86 joinOrganization.rejected');
                state.isLoading = false;
                state.error = action.error.message; // Access the error message
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
            .addCase(changeDefaultOrg.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(changeDefaultOrg.fulfilled, (state, action) => {
                printObject('US:136-->action.payload:\n', action.payload);
                const profile = action.payload.userProfile;
                const perms = action.payload.perms;
                // return {
                //     ...state,
                //     isLoading: false,
                // };
                return {
                    ...state,
                    profile: profile,
                    perms: perms,
                    isLoading: false,
                };
            })
            .addCase(changeDefaultOrg.rejected, (state, action) => {
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
