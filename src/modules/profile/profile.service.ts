import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Profile } from 'src/entities/Profile'
import { Repository } from 'typeorm'

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>
  ) {}

  async existsNickname(nickname: string): Promise<boolean> {
    return !!(await this.profileRepository.findOne({
      where: { nickname },
    }))
  }

  async getById(id: number) {
    return await this.profileRepository.findOneBy({ id: id })
  }

  async create(nickname: string) {
    if (await this.existsNickname(nickname))
      throw new BadRequestException('nickname taken')
    const profile = await this.profileRepository.create({
      nickname,
      rating: 1500,
    })
    return await profile.save()
  }
}
