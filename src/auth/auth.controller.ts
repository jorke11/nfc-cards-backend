import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OAuthDto } from './dto/oauth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with email and password. Sends a verification email to the provided email address.',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered. Verification email sent.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or email already exists.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many registration attempts. Rate limit exceeded.',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates a user with email and password. Returns a JWT access token upon successful authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated. JWT token returned.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or email not verified.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts. Rate limit exceeded.',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verifies a user email address using the token sent via email during registration.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token.',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('request-password-reset')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset email to the user. Contains a secure token that can be used to reset the password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User with provided email not found.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many password reset requests. Rate limit exceeded.',
  })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets user password using the token received via email from the password reset request.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token.',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post('magic-link')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({
    summary: 'Request magic link',
    description: 'Sends a passwordless authentication link to the user email. The link can be used for one-time login without password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Magic link sent successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User with provided email not found.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many magic link requests. Rate limit exceeded.',
  })
  async requestMagicLink(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestMagicLink(dto.email);
  }

  @Get('magic-link/verify')
  @ApiOperation({
    summary: 'Verify magic link',
    description: 'Verifies a magic link token and authenticates the user. Returns a JWT access token upon successful verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Magic link verified successfully. JWT token returned.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired magic link token.',
  })
  async verifyMagicLink(@Query('token') token: string) {
    return this.authService.verifyMagicLink(token);
  }

  @Post('oauth')
  @ApiOperation({
    summary: 'OAuth authentication',
    description: 'Handles OAuth authentication with third-party providers (Google, Apple). Accepts OAuth token and provider information.',
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth authentication successful. JWT token returned.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OAuth token or provider.',
  })
  async handleOAuth(@Body() oauthDto: OAuthDto) {
    return this.authService.handleOAuth(oauthDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns the currently authenticated user information based on the JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user information retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  async getCurrentUser(@Req() req: any) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logs out the current user. Since JWT is stateless, this is primarily handled client-side by removing the token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  async logout() {
    // JWT is stateless, so logout is handled client-side
    return { message: 'Logged out successfully' };
  }
}
