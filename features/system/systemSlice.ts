import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../utils/store';
import { initializeSystem, loadActiveOrg } from './systemThunks';

// --- Helpers
const makeToday = (): string => {
  const d = new Date();
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${yr}${mo}${da}`; // YYYYMMDD
};

// --- Types
export type MeeterState = {
  appName: string;
  region: string;
  eventRegion: string;
  stateProv: string;
  affiliateTitle: string;
  today: string;
  affiliation: string;
  affiliate: Record<string, any>;
  userRole: string;
  isLoading: boolean;
};

export type SystemState = {
  meeter: MeeterState;
  isLoading: boolean;
  activeOrg: Record<string, any>;
};

export type UpdateAffiliationPayload = {
  appName?: string;
  regions?: string[];
  eventRegions?: string[];
  title?: string;
  value?: string;
  userRole?: string;
  // allow other affiliate fields
  [k: string]: any;
};

// --- Initial state
const AFF = {
  ownerEmail: 'dflt@init.com',
  code: 'DFLT',
  ownerContact: 'Affiliate Owner',
  label: 'DEFAULT',
  status: 'active',
  category: 'default',
  description: 'default desc. value',
  ownerPhone: '1234567890',
  title: 'Welcome...',
};

export const initialState: SystemState = {
  meeter: {
    appName: 'Meeter',
    region: 'us#east#dflt',
    eventRegion: 'test',
    stateProv: 'GA',
    affiliateTitle: 'MEETER',
    today: makeToday(),
    affiliation: 'DFLT',
    affiliate: AFF,
    userRole: '',
    isLoading: true,
  },
  isLoading: true,
  activeOrg: {},
};

// --- Slice
export const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    updateAffiliation: (state, action: PayloadAction<UpdateAffiliationPayload>) => {
      const p = action.payload || {};
      // defensive updates: only set fields if provided
      if (p.appName) state.meeter.appName = p.appName;
      if (p.regions && p.regions.length) state.meeter.region = p.regions[0];
      if (p.eventRegions && p.eventRegions.length) state.meeter.eventRegion = p.eventRegions[0];
      if (p.title) state.meeter.affiliateTitle = p.title;
      if (p.value) state.meeter.affiliation = p.value;
      if (p.userRole) state.meeter.userRole = p.userRole;
      // merge affiliate object if provided
      if (Object.keys(p).length) state.meeter.affiliate = { ...state.meeter.affiliate, ...p };
      // no return necessary; immer handles immutability
    },

    logout: (state) => {
      state.activeOrg = {};
      state.meeter.userRole = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeSystem.pending, (state) => {
        state.isLoading = true;
        state.meeter.isLoading = true;
      })
      .addCase(initializeSystem.fulfilled, (state, action: any) => {
        const p: Partial<MeeterState> = action.payload || {};
        if (p.appName) state.meeter.appName = p.appName;
        if (p.region) state.meeter.region = p.region;
        if (p.eventRegion) state.meeter.eventRegion = p.eventRegion;
        if (p.affiliateTitle) state.meeter.affiliateTitle = p.affiliateTitle;
        if (p.affiliation) state.meeter.affiliation = p.affiliation;
        if (p.userRole) state.meeter.userRole = p.userRole;
        state.meeter.isLoading = false;
        state.isLoading = false;
      })
      .addCase(initializeSystem.rejected, (state) => {
        state.isLoading = false;
        state.meeter.isLoading = false;
      })
      .addCase(loadActiveOrg.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadActiveOrg.fulfilled, (state, action: PayloadAction<any>) => {
        state.activeOrg = action.payload || {};
        state.isLoading = false;
      })
      .addCase(loadActiveOrg.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

// Actions
export const { updateAffiliation, logout } = systemSlice.actions;

// Selectors
export const selectMeeter = (state: RootState) => state.system.meeter;
export const selectIsLoading = (state: RootState) => state.system.isLoading || state.system.meeter.isLoading;
export const selectActiveOrg = (state: RootState) => state.system.activeOrg;

// Default export reducer
export default systemSlice.reducer;
