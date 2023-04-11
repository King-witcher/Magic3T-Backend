import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { compareSync, hashSync } from 'bcrypt'
import { Profile } from "./Profile"

@Entity('registries')
export class Registry extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  username: string

  @Column()
  email: string

  @Column({ default: '', name: 'password_digest' })
  private passwordDigest: string

  @OneToOne(() => Profile)
  //@JoinColumn()
  profile: Profile

  setPassword(password: string) {
    this.passwordDigest = hashSync(password, 12)
  }

  checkPassword(password: string) {
    return compareSync(password, this.passwordDigest)
  }
}