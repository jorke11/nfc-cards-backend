import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
  if (process.env.NODE_ENV === 'production') {
    try {
      const { DataSource } = await import('typeorm');
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/**/{.ts,.js}'],
        migrationsRun: false,
      });

      await dataSource.initialize();
      await dataSource.runMigrations();
      await dataSource.destroy();
      console.log('✓ Database migrations completed');
    } catch (error) {
      console.warn('⚠ Migration execution skipped or failed (may already be applied):', error.message);
    }
  }
}

async function bootstrap() {
  // Run migrations before starting the app in production
  await runMigrations();

  const app = await NestFactory.create(AppModule);

  // Local file storage: serve /public/images as static and handle raw PUT uploads
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  const httpAdapter = app.getHttpAdapter().getInstance() as express.Express;
  httpAdapter.use('/public/images', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
  httpAdapter.use('/public/images', express.static(imagesDir));
  httpAdapter.put('/public/images/:filename', express.raw({ type: '*/*', limit: '10mb' }), (req: express.Request, res: express.Response) => {
    const filename = (req.params as { filename: string }).filename;
    const filePath = path.join(imagesDir, filename);
    fs.writeFile(filePath, req.body as Buffer, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Upload failed' });
      }
      res.status(200).json({ message: 'OK' });
    });
  });

  // Enable CORS for all origins
  app.enableCors({
    origin: '*',
    credentials: false,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NFC Digital Profile Platform API')
    .setDescription(
      'API documentation for the NFC Digital Profile Platform. ' +
      'Create and manage digital profiles accessible via NFC cards, QR codes, and direct links.',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication and registration endpoints')
    .addTag('Users', 'User account management endpoints')
    .addTag('Profiles', 'Digital profile management endpoints')
    .addTag('Storage', 'File upload and storage endpoints')
    .addTag('NFC', 'NFC card redirect endpoints')
    .addTag('Analytics', 'Profile analytics and tracking endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'NFC Digital Profile API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
