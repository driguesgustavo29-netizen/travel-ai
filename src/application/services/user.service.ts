import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/prisma/repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...profile } = user;
    return profile;
  }
  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    const user = await this.userRepository.update(userId, data);
    const { passwordHash, ...profile } = user;
    return profile;
  }
}
