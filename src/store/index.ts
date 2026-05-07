import { create } from 'zustand';
import type { Agent, Camp, ComponentEntry, BookingFailure, UserSearchResult } from '../types';

interface AppState {
  agent: Agent | null;
  activeCamps: Camp[];
  selectedCamp: Camp | null;
  searchResult: UserSearchResult | null;
  draftEntries: Record<string, ComponentEntry>;
  bookingFailures: BookingFailure[];
  setAgent: (agent: Agent | null) => void;
  setActiveCamps: (camps: Camp[]) => void;
  setSelectedCamp: (camp: Camp | null) => void;
  setSearchResult: (result: UserSearchResult | null) => void;
  updateDraftEntry: (componentId: string, entry: ComponentEntry) => void;
  addBookingFailure: (failure: BookingFailure) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  agent: null,
  activeCamps: [],
  selectedCamp: null,
  searchResult: null,
  draftEntries: {},
  bookingFailures: [],
  setAgent: (agent) => set({ agent }),
  setActiveCamps: (activeCamps) => set({ activeCamps }),
  setSelectedCamp: (selectedCamp) => set({ selectedCamp, searchResult: null, draftEntries: {}, bookingFailures: [] }),
  setSearchResult: (searchResult) => set({ searchResult }),
  updateDraftEntry: (componentId, entry) => set((state) => ({
    draftEntries: { ...state.draftEntries, [componentId]: entry }
  })),
  addBookingFailure: (failure) => set((state) => ({
    bookingFailures: [...state.bookingFailures, failure]
  })),
  logout: () => set({ agent: null, activeCamps: [], selectedCamp: null, searchResult: null, draftEntries: {} })
}));
