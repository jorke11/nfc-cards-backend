import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user details',
    description: 'Retrieves the complete user information for the currently authenticated user, excluding sensitive data like password.',
  })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  async getCurrentUser(@CurrentUser() user: User) {
    return this.usersService.sanitizeUser(user);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user',
    description: 'Updates the authenticated user account information such as email, name, or other profile details.',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  async updateCurrentUser(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateUser(user.id, updateUserDto);
    return this.usersService.sanitizeUser(updatedUser);
  }

  @Delete('me')
  @ApiOperation({
    summary: 'Delete current user account',
    description: 'Permanently deletes the authenticated user account and all associated data. This action cannot be undone.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  async deleteCurrentUser(@CurrentUser() user: User) {
    await this.usersService.deleteUser(user.id);
    return { message: 'Account deleted successfully' };
  }
}
