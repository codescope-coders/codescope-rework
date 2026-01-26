import { create } from "zustand";

export type VariablesStore = {
  // smooth scrolling
  smoothScrolling: boolean;
  enableSmoothScrolling: () => void;
  disableSmoothScrolling: () => void;

  // contact us dialog
  contactUs: boolean;
  showContactUs: () => void;
  hideContactUs: () => void;
};

export const useVariablesStore = create<VariablesStore>((set) => ({
  smoothScrolling: true,
  disableSmoothScrolling: () => set(() => ({ smoothScrolling: false })),
  enableSmoothScrolling: () => set(() => ({ smoothScrolling: true })),
  //contact us
  contactUs: false,
  showContactUs: () => set(() => ({ contactUs: true })),
  hideContactUs: () => set(() => ({ contactUs: false })),
}));
