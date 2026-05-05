import { IsNotEmpty, IsString, IsEmail, MinLength } from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    username!: string;

    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password!: string;

    @IsNotEmpty()
    @IsString()
    fullName!: string;

    @IsNotEmpty()
    @IsString()
    roleCode!: string;
}