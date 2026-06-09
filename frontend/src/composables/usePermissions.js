import { useAuthStore } from '@/stores/auth'

export function usePermissions() {
  const auth = useAuthStore()

  const can = (action) => {
    const role = auth.role
    const rules = {
      'manage:branches':  ['OWNER'],
      'manage:users':     ['OWNER'],
      'view:reports':     ['OWNER', 'BRANCH_MANAGER'],
      'manage:products':  ['OWNER', 'BRANCH_MANAGER', 'CASHIER'],
      'manage:inventory': ['OWNER', 'BRANCH_MANAGER', 'CASHIER'],
      'manage:suppliers': ['OWNER', 'BRANCH_MANAGER', 'CASHIER'],
      'manage:customers': ['OWNER', 'BRANCH_MANAGER', 'CASHIER'],
      'view:sales':       ['OWNER', 'BRANCH_MANAGER', 'CASHIER'],
    }
    return rules[action]?.includes(role) ?? false
  }

  return { can, role: auth.role, isOwner: auth.isOwner, isBranchManager: auth.isBranchManager }
}
