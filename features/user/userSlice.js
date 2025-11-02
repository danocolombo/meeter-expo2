import { createSlice } from '@reduxjs/toolkit';
import { printObject } from '@utils/helpers';
import {
    changeActiveOrg,
    changeOrg,
    errorTest,
    fetchProfilePicture,
    loginUser,
    saveHeroMessage,
    saveUserProfile,
    updateActiveOrgPermissions,
    updatePermissions,
} from './userThunks';

const initialState = {
    profile: {
        pictureObject: require('@assets/images/genericProiflePicture.png'),
    },
    affiliations: [],
    apiToken: '',
    isAuthenticated: false,
    isLoading: false,
    isLimitedUser: false,
};

// Helper: summarize affiliations into [{ organization_id, roles: [] }, ...]
function summarizeAffiliations(rawAffiliations) {
    if (!Array.isArray(rawAffiliations)) return [];

    const map = new Map();

    rawAffiliations.forEach((aff) => {
        if (!aff || typeof aff !== 'object') return;

        // Support both snake_case and camelCase keys
        const orgId =
            aff.organization_id ||
            aff.organizationId ||
            aff.organization?.id ||
            aff.organization?.Id;
        const role = aff.role || aff.roles || null;
        const status = aff.status || aff.state || null;

        if (!orgId) return; // skip malformed
        if (status !== 'active') return; // only active
        if (!role) return;

        const entry = map.get(orgId) || new Set();
        entry.add(role);
        map.set(orgId, entry);
    });

    // Convert to desired array shape
    const result = [];
    for (const [organization_id, rolesSet] of map.entries()) {
        result.push({
            organization_id,
            roles: Array.from(rolesSet),
        });
    }

    return result;
}

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
            state.profile = {
                pictureObject: require('@assets/images/genericProiflePicture.png'),
            };
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
            state.profile = {
                pictureObject: require('@assets/images/genericProiflePicture.png'),
            };
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
                // Standard profile update - preserve pictureObject if not provided
                const currentPictureObject =
                    state.profile.pictureObject ||
                    require('@assets/images/genericProiflePicture.png');
                state.profile = {
                    ...action.payload.profile,
                    pictureObject:
                        action.payload.profile.pictureObject ||
                        currentPictureObject,
                };
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
        setPictureObject: (state, action) => {
            // Store the cached picture object in user profile
            state.profile = {
                ...state.profile,
                pictureObject: action.payload,
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
                const incomingProfile =
                    action.payload.userProfile || action.payload;
                state.profile = {
                    ...state.profile, // Keep existing profile data
                    ...incomingProfile, // Overlay with updated data
                };
                // derive simplified affiliations for quick lookup in state
                try {
                    state.affiliations = summarizeAffiliations(
                        incomingProfile?.affiliations ||
                            incomingProfile?.affiliations?.items ||
                            []
                    );
                } catch (_) {
                    // keep previous affiliations on error
                }
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
                    const currentPictureObject =
                        state.profile.pictureObject ||
                        require('@assets/images/genericProiflePicture.png');
                    const incomingProfile = action.payload.profile;
                    // derive summarized affiliations
                    let derivedAffiliations = [];
                    try {
                        derivedAffiliations = summarizeAffiliations(
                            incomingProfile?.affiliations ||
                                incomingProfile?.affiliations?.items ||
                                []
                        );
                    } catch (_) {
                        derivedAffiliations = [];
                    }

                    return {
                        ...state,
                        ...action.payload, // This will set apiToken, isAuthenticated, isLoading, isLimitedUser
                        profile: {
                            ...incomingProfile,
                            pictureObject: currentPictureObject, // Preserve the pictureObject
                        },
                        affiliations: derivedAffiliations,
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
                const currentPictureObject =
                    state.profile.pictureObject ||
                    require('@assets/images/genericProiflePicture.png');
                state.profile = {
                    ...action.payload.profile,
                    pictureObject: currentPictureObject,
                };
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

                const currentPictureObject =
                    state.profile.pictureObject ||
                    require('@assets/images/genericProiflePicture.png');
                // derive affiliations from returned profile as well
                let derivedAffiliations = [];
                try {
                    derivedAffiliations = summarizeAffiliations(
                        profile?.affiliations ||
                            profile?.affiliations?.items ||
                            []
                    );
                } catch (_) {
                    derivedAffiliations = [];
                }

                return {
                    ...state,
                    profile: {
                        ...profile,
                        pictureObject: currentPictureObject,
                    },
                    affiliations: derivedAffiliations,
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
            })
            .addCase(fetchProfilePicture.fulfilled, (state, action) => {
                // Store the fetched profile picture in the Redux state
                console.log(
                    '🖼️ Redux: fetchProfilePicture.fulfilled - storing image in state'
                );
                console.log(
                    '🖼️ Image data length:',
                    action.payload?.length || 'undefined'
                );
                if (state.profile) {
                    state.profile.pictureObject = action.payload;
                    console.log(
                        '✅ Profile pictureObject updated in Redux state'
                    );
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
    setPictureObject,
} = userSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export default userSlice.reducer;
