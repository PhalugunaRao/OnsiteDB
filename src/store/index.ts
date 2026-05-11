import { create } from 'zustand';
import type { Agent, Camp, ComponentEntry, BookingFailure, UserSearchResult } from '../types';
import { clearStoredAuth, getStoredAgentKey } from '../api/client';
import { hydrateAuthState, persistAuthState } from '../api/auth';

interface AppState {
  agent: Agent | null;
  xAgentKey: string;
  activeCamps: Camp[];
  selectedCamp: Camp | null;
  searchResult: UserSearchResult | null;
  draftEntries: Record<string, ComponentEntry>;
  bookingFailures: BookingFailure[];
  setAgent: (agent: Agent | null, xAgentKey?: string) => void;
  setActiveCamps: (camps: Camp[]) => void;
  setSelectedCamp: (camp: Camp | null) => void;
  setSearchResult: (result: UserSearchResult | null) => void;
  updateDraftEntry: (componentId: string, entry: ComponentEntry) => void;
  addBookingFailure: (failure: BookingFailure) => void;
  logout: () => void;
}

const hydrated = hydrateAuthState();

export const useStore = create<AppState>((set) => ({
  agent: hydrated?.agent || null,
  xAgentKey: getStoredAgentKey(),
  activeCamps: hydrated?.activeCamps || [],
  selectedCamp: hydrated?.selectedCamp || null,
  searchResult: null,
  draftEntries: {},
  bookingFailures: [],
  setAgent: (agent, xAgentKey) => set((state) => {
    const next = { ...state, agent, xAgentKey: xAgentKey || state.xAgentKey };
    persistAuthState({ agent, activeCamps: state.activeCamps, selectedCamp: state.selectedCamp });
    return { agent, xAgentKey: next.xAgentKey };
  }),
  setActiveCamps: (activeCamps) => set((state) => {
    persistAuthState({ agent: state.agent, activeCamps, selectedCamp: state.selectedCamp });
    return { activeCamps };
  }),
  setSelectedCamp: (selectedCamp) => set((state) => {
    persistAuthState({ agent: state.agent, activeCamps: state.activeCamps, selectedCamp });
    return { selectedCamp, searchResult: null, draftEntries: {}, bookingFailures: [] };
  }),
  setSearchResult: (searchResult) => set({ searchResult }),
  updateDraftEntry: (componentId, entry) => set((state) => ({
    draftEntries: { ...state.draftEntries, [componentId]: entry }
  })),
  addBookingFailure: (failure) => set((state) => ({
    bookingFailures: [...state.bookingFailures, failure]
  })),
  logout: () => {
    clearStoredAuth();
    set({ agent: null, xAgentKey: '', activeCamps: [], selectedCamp: null, searchResult: null, draftEntries: {}, bookingFailures: [] });
  }
}));
