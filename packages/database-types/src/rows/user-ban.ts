export type BanType = 'temporary' | 'permanent'

export interface UserBan {
  type: BanType
  reason?: string
  bannedAt: Date
  expiresAt?: Date // Only for temporary bans
  bannedBy: string // userId of the creator
}
