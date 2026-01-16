import { ListMatchesResult } from '@magic3t/api-types'
import axios from 'axios'
import { Console, SystemCvars } from '@/lib/console'

const controller = () => {
  const apiUrl = Console.getCvarValue(SystemCvars.SvApiUrl)
  return axios.create({
    baseURL: `${apiUrl}/matches`,
  })
}

export async function getCurrentMatch(token: string): Promise<{ id: string }> {
  const response = await controller().get('/current', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (response.status !== 200) {
    throw new Error('Failed to fetch current match.')
  }

  return response.data
}

export async function getMatchesByUser(userId: string, limit: number): Promise<ListMatchesResult> {
  const response = await controller().get(`/user/${userId}`, {
    params: {
      limit,
    },
  })
  return response.data
}
