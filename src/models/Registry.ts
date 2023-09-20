import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { compareSync, hashSync } from 'bcrypt'
import { Profile } from './Profile'

@Entity('registries')
export class Registry extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  username: string

  @Column()
  email: string

  @Column({
    name: 'password_digest',
    transformer: {
      to: (password) => hashSync(password, 12),
      from: (digest) => digest,
    },
  })
  private password: string

  @OneToOne(() => Profile, (profile) => profile.registry, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'profile_id',
  })
  profile: Profile

  checkPassword(password: string) {
    return compareSync(password, this.password)
  }
}
