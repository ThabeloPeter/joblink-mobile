import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPut, handleApiError, handleApiSuccess } from '../utils/api'
import { Company } from '../../types'

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const data = await apiGet<{ companies: Company[] }>('/api/admin/companies')
      return data.companies || []
    },
  })
}

export function useUpdateCompanyStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ companyId, status }: { companyId: string; status: 'approved' | 'rejected' }) => {
      return apiPut(`/api/admin/companies/${companyId}`, { status })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      handleApiSuccess(
        `Company ${variables.status === 'approved' ? 'approved' : 'rejected'} successfully`
      )
    },
    onError: (error) => {
      handleApiError(error, 'Failed to update company status')
    },
  })
}


