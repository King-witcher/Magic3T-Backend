import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('profiles')
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  nickname: string

  @Column({ default: 1500 })
  rating: number
}