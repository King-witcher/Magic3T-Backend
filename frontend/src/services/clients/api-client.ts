import { CrashReportCommand, GetStatusResponse } from '@magic3t/api-types'
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
