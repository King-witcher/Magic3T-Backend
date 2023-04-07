import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import CheatSheetDto from './cheatsheet.dto'
import { ServiceService } from './service/service.service'

@Controller('cheatsheet')
export class CheatsheetController {
    
  constructor (private service: ServiceService) {
        
  }

    @Post('post-with-body')
  postWithBody(@Body() body: CheatSheetDto) {
    console.log(body)
    return body
  }

    @Get(':id')
    getWithparams(@Param('id', ParseIntPipe) id: number, @Query('sortBy') sortBy: string) {
      console.log(id, sortBy)
      const a = this.service.call()
      return {
        id,
        sortBy,
        a
      }
    }
}
