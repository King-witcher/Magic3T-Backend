import type { WithId } from '../with-id'

export interface DevopsConfigModel extends WithId<'devops'> {
  maintenance_mode: boolean
}
