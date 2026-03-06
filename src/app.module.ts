import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { StorageModule } from './storage/storage.module';
import { EmailModule } from './email/email.module';
import { NfcModule } from './nfc/nfc.module';
import { AnalyticsModule } from './analytics/analytics.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import awsConfig from './config/aws.config';
import brevoConfig from './config/brevo.config';
import oauthConfig from './config/oauth.config';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, awsConfig, brevoConfig, oauthConfig],
    }),

    // Database module
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      // useFactory: (configService: ConfigService) => ({
      //   ...configService.get('database'),
      //   entities: [__dirname + '/../**/*.entity{.ts,.js}'], // <--- AGREGADO AQUÍ
      //   autoLoadEntities: true,    // <--- AGREGADO AQUÍ
      //   synchronize: false, // <--- MANTENER EN FALSE SIEMPRE
      //   logging: true,
      // }),
      useFactory: (config: ConfigService) => {
    const dbConfig = config.get('database');
    
    // LOG DE SEGURIDAD SENIOR
    console.log('--- DIAGNÓSTICO DE CONEXIÓN ---');
    console.log('DB_HOST:', dbConfig.host);
    console.log('DB_NAME:', dbConfig.database);
    console.log('DB_USER:', dbConfig.username);
    console.log('-------------------------------');

    return {
      ...dbConfig,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: false, // ¡Déjalo en false para no romper las llaves foráneas!
      logging: true,      // Esto imprimirá las queries reales en los logs
    };
  },
    }),

    // Rate limiting module
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000'),
        limit: parseInt(process.env.THROTTLE_LIMIT || '10'),
      },
    ]),

    // Feature modules
    AuthModule,
    UsersModule,
    ProfilesModule,
    StorageModule,
    EmailModule,
    NfcModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
