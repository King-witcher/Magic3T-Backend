import { Controller, Get } from '@nestjs/common';
import { IsPublic } from '../auth/decorators/is-public.decorator';

@Controller('game')
export class GameController {
}
