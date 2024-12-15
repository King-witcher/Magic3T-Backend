import { Test, TestingModule } from '@nestjs/testing'
import { ConfigRepository } from './config.repository'

describe('ConfigService', () => {
  let repository: ConfigRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigRepository],
    }).compile()

    repository = module.get<ConfigRepository>(ConfigRepository)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })
})
