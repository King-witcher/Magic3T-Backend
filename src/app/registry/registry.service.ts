import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Profile } from 'src/entities/Profile'
import { Registry } from 'src/entities/Registry'
import { DataSource, Repository } from 'typeorm'

@Injectable()
export class RegistryService {
  constructor(
    @InjectRepository(Registry)
    private registryRepository: Repository<Registry>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private dataSource: DataSource
  ) {}

  async existsUsername(username: string): Promise<boolean> {
    return !!(await this.registryRepository.findOne({
      where: { username },
    }))
  }

  async createRegistryAndProfile(
    email: string,
    username: string,
    password: string,
    nickname: string
  ) {
    const profile = this.profileRepository.create({
      nickname,
      nicknameDigest: nickname,
    })
    const registry = this.registryRepository.create({
      email,
      username,
      profile,
      password,
    })

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      //await queryRunner.manager.save(profile)
      await queryRunner.manager.save(registry)
      await queryRunner.commitTransaction()
    } catch (error: any) {
      console.error(error.message)
      await queryRunner.rollbackTransaction()
      throw new InternalServerErrorException()
    } finally {
      await queryRunner.release()
    }
  }

  async findByUsername(username: string): Promise<Registry | null> {
    return (
      (await this.registryRepository.findOne({
        where: {
          username,
        },
        relations: ['profile'],
      })) || null
    )
  }
}
