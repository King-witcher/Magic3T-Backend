import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Registry } from './Registry'

@Entity('profiles')
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  nickname: string

  @Column({ default: 1500 })
  rating: number

  @OneToOne(() => Registry, (registry) => registry.profile)
  registry: Registry
}
