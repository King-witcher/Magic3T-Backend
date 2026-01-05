import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { BaseError } from '../errors/base-error'

@Catch(BaseError)
export class HttpFilter implements ExceptionFilter {
  catch(exception: BaseError, argumentsHost: ArgumentsHost) {
    const next = argumentsHost.switchToHttp().getNext()
    const httpException = new HttpException(exception.message, exception.httpStatus)
    if (next) next(httpException)
    else throw httpException
  }
}
