import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator'
import { BanType } from '@magic3t/database-types'

export class BanUserCommand {
  @ApiProperty({ enum: ['temporary', 'permanent'] })
  @IsDefined()
  @IsEnum(['temporary', 'permanent'])
  type: BanType

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string

  @ApiProperty({ required: false, description: 'Expiration date for temporary bans (ISO string)' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string
}
