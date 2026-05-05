import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                isActive: true,
                createdAt: true,
                role: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            }
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                isActive: true,
                createdAt: true,
                role: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const dataToUpdate: any = { ...updateUserDto };

        // Handle Role update
        if (updateUserDto.roleCode) {
            const role = await this.prisma.role.findUnique({ where: { code: updateUserDto.roleCode } });
            if (!role) {
                throw new BadRequestException('Role not found');
            }
            dataToUpdate.roleId = role.id;
            delete dataToUpdate.roleCode;
        }

        // Handle Password update
        if (updateUserDto.password) {
            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(updateUserDto.password, salt);
        }

        // Check uniqueness if email or username is being updated
        if (updateUserDto.email || updateUserDto.username) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: updateUserDto.email },
                        { username: updateUserDto.username }
                    ],
                    NOT: { id }
                }
            });

            if (existingUser) {
                throw new BadRequestException('Username or email already exists');
            }
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: dataToUpdate,
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                isActive: true,
                role: true
            }
        });

        return { message: 'User updated successfully', user: updatedUser };
    }

    async remove(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.delete({
            where: { id }
        });

        return { message: 'User deleted successfully' };
    }
}
