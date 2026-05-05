import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { JwtPayloadType } from "../../utils/jwttype";
import { JwtService } from "@nestjs/jwt";
import { CURRENT_USER_KEY } from "../../utils/constant";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        if (token && type === "Bearer") {
            try {
                const payload: JwtPayloadType = await this.jwtService.verifyAsync(
                    token,
                    {
                        secret: process.env.JWT_SECRET || "defaultSecret" 
                    }
                );
                request[CURRENT_USER_KEY] = payload;
            } catch (error) {
                throw new UnauthorizedException("Invalid token, please login again");
            }
        }
        else {
            throw new UnauthorizedException("No token provided");
        }
        return true;
    }
}