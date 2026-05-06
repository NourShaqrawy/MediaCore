import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";


@Injectable()
export class AuthenticateService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) { }

    public async register(registerDto: RegisterDto) {
        const { email, password, username, fullName, roleCode } = registerDto;

        const userFromDb = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }]
            }
        });

        if (userFromDb) {
            throw new BadRequestException("User with this email or username already exists");
        }

        const role = await this.prisma.role.findFirst({ where: { code: roleCode } });
        if (!role) {
            throw new BadRequestException("The specified role does not exist");
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await this.prisma.user.create({
            data: {
                username,
                email,
                fullName,
                password: passwordHash,
                roleId: role.id
            }
        });

        const payload = { id: newUser.id, username: newUser.username, role: role.code };
        const accessToken = await this.jwtService.signAsync(payload);

        return {
            message: "User successfully registered",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.fullName
            },
            accessToken,
        };
    }

    public async login(loginDto: LoginDto) {
        const { emailOrUsername, password } = loginDto;

        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: emailOrUsername },
                    { username: emailOrUsername }
                ]
            },
            include: {
                role: true 
            }
        });

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!user.isActive) {
            throw new UnauthorizedException("Account is deactivated");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const payload = { id: user.id, username: user.username, role: user.role.code };
        const accessToken = await this.jwtService.signAsync(payload);

        return {
            message: "Successfully logged in",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role.code
            },
            accessToken,
        };
    }

        
}