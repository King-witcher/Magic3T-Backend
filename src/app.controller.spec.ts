import { AppController } from '@/app.controller'
import { ImATeapotException } from '@nestjs/common'

describe('AppModule', () => {
  let appController: AppController
  beforeEach(() => {
    appController = new AppController()
  })

  describe('status', () => {
    it('should return { status: "available" }', () => {
      expect(appController.status()).toEqual({ status: 'available' })
    })
  })

  describe('teapot', () => {
    it('should throw teapot', () => {
      expect(appController.teapot).toThrow(ImATeapotException)
    })
  })

  describe('version', () => {
    it('should return a version', () => {
      expect(appController.getVersion()).toMatch(/\d+.\d+.\d+/)
    })
  })
})
