import { Catch, ExceptionFilter } from '@nestjs/common'
import { Panic, panic } from '../utils/rust/panic'

/**
 * Catches all unhandled errors and converts them into panics to be caught by the PanicFilter.
 */
@Catch(Error)
export class ExceptionToPanicMapper implements ExceptionFilter {
  catch(error: Error) {
    if (error instanceof Panic) throw error
    console.error('Unhandled exception caught:', error)
    panic('unhandled exception')
  }
}
