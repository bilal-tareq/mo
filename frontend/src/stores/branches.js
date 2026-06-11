import { create } from 'zustand'
import { branchesApi } from '@/api/branches'

export const useBranchesStore = create((set, get) => ({
  branches: [],
  currentBranch: null,
  loading: false,

  fetchBranches: async () => {
    set({ loading: true })
    try {
      const { data } = await branchesApi.list()
      const branches = data.results || data
      set({
        branches,
        currentBranch: get().currentBranch || (branches.length ? branches[0] : null),
      })
    } finally {
      set({ loading: false })
    }
  },

  setBranch: (branch) => set({ currentBranch: branch }),
}))
