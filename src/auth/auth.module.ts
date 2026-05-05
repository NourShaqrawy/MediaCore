import { Module } from "@nestjs/common";
import { AuthenticateService } from "./auth.service";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { PrismaModule } from "../../prisma/prisma.module";
import { AuthController } from "./auth.controller";



@Module({
    controllers: [AuthController],
    providers: [AuthenticateService,
        PrismaService

    ],
    imports: [
        PrismaModule,
        JwtModule.registerAsync({
            useFactory: async (): Promise<JwtModuleOptions> => {
                return {
                    global: true,
                    secret: process.env.JWT_SECRET,
                    signOptions: {
                        expiresIn: process.env.JWT_EXPIRES_IN as any,
                    },
                };
            },
        }),
    ],

    exports: []

})
export class AuthModule { }