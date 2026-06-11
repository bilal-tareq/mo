import { useAuthStore } from '@/stores/auth'

export function usePermissions() {
  const user = useAuthStore(s => s.user)
  const role = user?.role || null
  const isOwner = role === 'OWNER'
  const isBranchManager = ['OWNER', 'BRANCH_MANAGER'].includes(role)

  const can = (action) => {
    const rules = {
      'manage:branches':  ['OWNER'],
      'manage:users':     ['OWNER'],
      'view:reports':     ['OWNER', 'BRANCH_MANAGER'],
      'manage:products':  ['OWNER', 'BRANCH_MANAGER'],
      'manage:inventory': ['OWNER', 'BRANCH_MANAGER'],
      'manage:customers': ['OWNER', 'BRANCH_MANAGER'],
      'view:sales':       ['OWNER', 'BRANCH_MANAGER'],
    }
    return rules[action]?.includes(role) ?? false
  }

  return { can, role, isOwner, isBranchManager }
}
