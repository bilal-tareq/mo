import { defineStore } from 'pinia'
import { ref } from 'vue'
import { branchesApi } from '@/api/branches'

export const useBranchesStore = defineStore('branches', () => {
  const branches       = ref([])
  const currentBranch  = ref(null)
  const loading        = ref(false)

  async function fetchBranches() {
    loading.value = true
    try {
      const { data } = await branchesApi.list()
      branches.value = data.results || data
      if (!currentBranch.value && branches.value.length)
        currentBranch.value = branches.value[0]
    } finally {
      loading.value = false
    }
  }

  function setBranch(branch) {
    currentBranch.value = branch
  }

  return { branches, currentBranch, loading, fetchBranches, setBranch }
})
