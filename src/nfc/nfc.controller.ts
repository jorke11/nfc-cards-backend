import {
  Controller,
  Get,
  Param,
  Res,
  Req,
  NotFoundException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { NfcService } from './nfc.service';

@ApiTags('NFC')
@Controller('nfc')
export class NfcController {
  constructor(private readonly nfcService: NfcService) {}

  @Get(':uniqueId')
  @ApiOperation({
    summary: 'Redirect to profile',
    description: 'Redirects to the profile page associated with the NFC unique identifier. This is the main endpoint called when an NFC card is tapped.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to the profile page or 404 page if not found.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found with the provided unique ID.',
  })
  async redirectToProfile(
    @Param('uniqueId') uniqueId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const redirectUrl = await this.nfcService.getRedirectUrl(uniqueId);

      // Note: Analytics tracking will be handled by the frontend or the AnalyticsService
      // when the profile page actually loads. This keeps the redirect fast.

      return res.redirect(302, redirectUrl);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.redirect(302, `${process.env.FRONTEND_URL || 'http://localhost:3000'}/404`);
      }
      throw error;
    }
  }
}
