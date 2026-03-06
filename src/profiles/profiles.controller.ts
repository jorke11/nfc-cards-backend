import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new profile',
    description: 'Creates a new NFC profile for the authenticated user with contact information, social links, and customization options.',
  })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or username already taken.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  async createProfile(
    @CurrentUser() user: User,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.profilesService.createProfile(user.id, createProfileDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my profile',
    description: 'Retrieves the NFC profile for the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found for the current user.',
  })
  async getMyProfile(@CurrentUser() user: User) {
    return this.profilesService.findByUserId(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update my profile',
    description: 'Updates the NFC profile information for the authenticated user including contact details, social links, and theme settings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  async updateMyProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.updateProfile(user.id, updateProfileDto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete my profile',
    description: 'Permanently deletes the NFC profile for the authenticated user. This action cannot be undone.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  async deleteMyProfile(@CurrentUser() user: User) {
    await this.profilesService.deleteProfile(user.id);
    return { message: 'Profile deleted successfully' };
  }

  @Patch('me/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Toggle profile status',
    description: 'Enables or disables the NFC profile. When disabled, the profile will not be accessible via NFC redirect.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile status updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  async toggleProfileStatus(
    @CurrentUser() user: User,
    @Body('enabled') enabled: boolean,
  ) {
    return this.profilesService.toggleProfileStatus(user.id, enabled);
  }

  @Get('check-username/:username')
  @ApiOperation({
    summary: 'Check username availability',
    description: 'Checks if a username is available for use. Returns true if the username is not taken.',
  })
  @ApiResponse({
    status: 200,
    description: 'Username availability checked successfully.',
  })
  async checkUsernameAvailability(@Param('username') username: string) {
    const available = await this.profilesService.checkUsernameAvailability(
      username,
    );
    return { available };
  }

  @Get('username/:username')
  @ApiOperation({
    summary: 'Get profile by username',
    description: 'Retrieves a public NFC profile by its unique username.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found with the provided username.',
  })
  async getProfileByUsername(@Param('username') username: string) {
    return this.profilesService.findByUsername(username);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get profile by ID',
    description: 'Retrieves a public NFC profile by its unique identifier.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found with the provided ID.',
  })
  async getProfileById(@Param('id') id: string) {
    return this.profilesService.findByUniqueId(id);
  }
}
