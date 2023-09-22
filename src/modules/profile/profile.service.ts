import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Profile } from 'src/models/Profile'
import { Repository } from 'typeorm'

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>
  ) {}

  async existsNickname(nickname: string): Promise<boolean> {
    return !!(await this.profileRepository.findOne({
      where: { nicknameDigest: nickname },
    }))
  }

  async getById(id: number) {
    return await this.profileRepository.findOneBy({ id })
  }

  async getByNickname(nickname: string) {
    return await this.profileRepository.findOneBy({ nicknameDigest: nickname })
  }
}
