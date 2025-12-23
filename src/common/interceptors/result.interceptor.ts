import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { map, Observable } from 'rxjs'
import { Result } from '../utils'

@Injectable()
export class ResultInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler
  ): Observable<unknown> {
    return next.handle().pipe(
      map((result) => {
        if (Result.isResult(result)) result.serialize()
        return result
      })
    )
  }
}
