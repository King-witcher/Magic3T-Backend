import { IsNotEmpty } from "class-validator"

export default class CheatSheetDto {
    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    password: string
}
