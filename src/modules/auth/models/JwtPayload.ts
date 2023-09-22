export interface JwtPayload {
  registryId: number
  profileId: number
  username: string
  email: string
  nickname: string
  iat?: string
}
