import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common'; // Gunakan bawaan untuk kompatibilitas transform
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. CORS & Security
  app.enableCors();

  // 2. Global Pipes (Kunci agar CURL & Swagger Berhasil)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Mengubah string ke number otomatis
      transformOptions: { enableImplicitConversion: true },
      whitelist: true, // Menghapus field yang tidak ada di DTO
      forbidNonWhitelisted: false,
    }),
  );

  // 3. Global Filters & Interceptors
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 4. Static Assets (Tetap ada untuk fallback)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 5. Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Signage Smart Food API')
    .setDescription('Dokumentasi API Terintegrasi Cloudinary & Railway')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('products')
    .addTag('recipes')
    .addTag('ingredients')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 6. Start Server
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on: http://localhost:${port}/api`);
}

bootstrap();