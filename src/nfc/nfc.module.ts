import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfcService } from './nfc.service';
import { NfcController } from './nfc.controller';
import { Profile } from '../entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
  controllers: [NfcController],
  providers: [NfcService],
  exports: [NfcService],
})
export class NfcModule {}
