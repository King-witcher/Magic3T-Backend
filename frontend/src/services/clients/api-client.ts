import { CrashReportCommand, GetStatusResponse, ListMatchesResult } from '@magic3t/api-types'
import { BaseApiClient } from './base-api-client'

export class UserApiClient extends BaseApiClient {
  constructor() {
    super('users')
  }
}

export class MatchApiClient extends BaseApiClient {
  constructor() {
    super('matches')
  }

  /**
   * Gets the current match for the authenticated user.
   */
  async getCurrentMatch(): Promise<{ id: string }> {
    return this.get<{ id: string }>('current')
  }

  /**
   * Checks if the authenticated user is in an active match.
   */
  async amActiveMatch(): Promise<boolean> {
    return this.get<boolean>('me/am-active')
  }

  /**
   * Gets matches by user ID.
   */
  async getMatchesByUser(userId: string, limit: number): Promise<ListMatchesResult> {
    return this.get<ListMatchesResult>(`user/${userId}?limit=${limit}`, false)
  }
}

export class QueueApiClient extends BaseApiClient {
  constructor() {
    super('queue')
  }
}

export class ApiClient extends BaseApiClient {
  public readonly user = new UserApiClient()
  public readonly match = new MatchApiClient()
  public readonly queue = new QueueApiClient()

  /**
   * Gets the status of the API.
   */
  async getStatus(): Promise<GetStatusResponse> {
    return this.get<GetStatusResponse>('status', false)
  }

  /**
   * Reports a crash to the API.
   */
  async reportCrash(data: CrashReportCommand): Promise<void> {
    await this.post('crash-report', data, false)
  }
}

export const apiClient = new ApiClient()
