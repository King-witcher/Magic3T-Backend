import { Result } from '@/common'
import { panic } from './common/utils/rust/panic'

global.Ok = Result.Ok
global.Err = Result.Err
global.panic = panic
