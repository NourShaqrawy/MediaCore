import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthenticateService } from "./auth.service";
import { AuthGuard } from "./guard/auth.guard";
import { RolesGuard } from "./guard/roles.guard";
import { Roles } from "./guard/roles.decorator";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthenticateService) {}

    @Post('register')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('ADMIN')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')  
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }


}
