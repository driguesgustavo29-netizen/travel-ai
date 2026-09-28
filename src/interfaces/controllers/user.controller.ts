import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  async getProfile(@User() user: { userId: string }) {
    return this.userService.getProfile(user.userId);
  }
  @Put('me')
  async updateProfile(@User() user: { userId: string }, @Body() body: { name?: string; email?: string }) {
    return this.userService.updateProfile(user.userId, body);
  }
}
