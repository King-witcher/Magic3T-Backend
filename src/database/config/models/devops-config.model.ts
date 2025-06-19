import { WithId } from '@/database/types'

export interface DevopsConfigModel extends WithId {
  maintenance_mode: boolean
}
