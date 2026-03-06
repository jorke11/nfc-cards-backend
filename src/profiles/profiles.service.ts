import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { Profile } from '../entities/profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  private readonly RESERVED_USERNAMES = [
    'admin',
    'api',
    'about',
    'help',
    'support',
    'login',
    'register',
    'dashboard',
    'profile',
    'settings',
    'analytics',
    'nfc',
    'qr',
    'p',
  ];

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    // Check if user already has a profile
    const existingProfile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('User already has a profile');
    }

    // Validate username if provided
    if (createProfileDto.username) {
      await this.validateUsername(createProfileDto.username);
    }

    // Generate unique ID
    const uniqueId = await this.generateUniqueId();

    // Create profile
    const profile = this.profileRepository.create({
      ...createProfileDto,
      userId,
      uniqueId,
    });

    return await this.profileRepository.save(profile);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.findByUserId(userId);

    // Validate username if being changed
    if (
      updateProfileDto.username &&
      updateProfileDto.username !== profile.username
    ) {
      await this.validateUsername(updateProfileDto.username);
    }

    // Update profile
    Object.assign(profile, updateProfileDto);
    return await this.profileRepository.save(profile);
  }

  async findByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async findByUsername(username: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { username: username.toLowerCase() },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (!profile.isEnabled) {
      throw new NotFoundException('This profile is currently disabled');
    }

    return profile;
  }

  async findByUniqueId(uniqueId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { uniqueId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (!profile.isEnabled) {
      throw new NotFoundException('This profile is currently disabled');
    }

    return profile;
  }

  async findById(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async deleteProfile(userId: string): Promise<void> {
    const profile = await this.findByUserId(userId);
    await this.profileRepository.remove(profile);
  }

  async toggleProfileStatus(userId: string, enabled: boolean): Promise<Profile> {
    const profile = await this.findByUserId(userId);
    profile.isEnabled = enabled;
    return await this.profileRepository.save(profile);
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    // Check reserved usernames
    if (this.RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return false;
    }

    // Check if username is taken
    const existingProfile = await this.profileRepository.findOne({
      where: { username: username.toLowerCase() },
    });

    return !existingProfile;
  }

  private async validateUsername(username: string): Promise<void> {
    // Check reserved usernames
    if (this.RESERVED_USERNAMES.includes(username.toLowerCase())) {
      throw new BadRequestException('This username is reserved');
    }

    // Check if username is already taken
    const existingProfile = await this.profileRepository.findOne({
      where: { username: username.toLowerCase() },
    });

    if (existingProfile) {
      throw new ConflictException('Username is already taken');
    }
  }

  private async generateUniqueId(): Promise<string> {
    let uniqueId = nanoid(10);
    let isUnique = false;

    // Keep generating until we get a unique ID
    while (!isUnique) {
      const existing = await this.profileRepository.findOne({
        where: { uniqueId },
      });
      if (!existing) {
        isUnique = true;
      } else {
        uniqueId = nanoid(10); // Generate new ID if not unique
      }
    }

    return uniqueId;
  }
}
