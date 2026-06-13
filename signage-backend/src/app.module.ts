import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { LoggerModule } from './common/logger/logger.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module'; // ✅ TAMBAHKAN INI


// Entities
import { DeviceEntity } from './entities/device.entity';
import { RecipeEntity } from './entities/recipe.entity';
import { ProductEntity } from './entities/product.entity';
import { VideoEntity } from './entities/video.entity';
import { ScanEntity } from './entities/scan.entity';
import { UserEntity } from './entities/user.entity';
import { IngredientEntity } from './entities/ingredient.entity';
import { ProductRatingEntity } from 'src/entities/product-rating.entity'; // Sesuaikan path-nya
import { OrderEntity } from './entities/order.entity';

// Modules (Jika ada module terpisah)
import { UsersModule } from './users/users.module';

// Controllers
import { DevicesController } from './devices/devices.controller';
import { RecipesController } from './recipes/recipes.controller';
import { ProductsController } from './products/products.controller';
import { VideosController } from './videos/videos.controller';
import { ScansController } from './scans/scans.controller';
import { SystemController } from './system/system.controller';
import { UploadsController } from './uploads/uploads.controller';
import { IngredientsController } from './ingredients/ingredients.controller';

// Services
import { DevicesService } from './devices/devices.service';
import { RecipesService } from './recipes/recipes.service';
import { ProductsService } from './products/products.service';
import { VideosService } from './videos/videos.service';
import { ScansService } from './scans/scans.service';
import { UploadsService } from './uploads/uploads.service';
import { IngredientsService } from './ingredients/ingredients.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    LoggerModule,
    UsersModule,
    CloudinaryModule, // ✅ DAFTARKAN DI SINI
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const nodeEnv = config.get<string>('NODE_ENV');

        // 👉 PRODUCTION (Railway)
        if (nodeEnv === 'production' && databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: false,
            ssl: { rejectUnauthorized: false },
          };
        }

        // 👉 LOCAL
        return {
          type: 'postgres',
          host: config.get('DB_HOST'),
          port: Number(config.get('DB_PORT')),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true, // Hati-hati di production, biarkan true hanya di local
          ssl: false,
        };
      },
    }),
    TypeOrmModule.forFeature([
      DeviceEntity,
      RecipeEntity,
      ProductEntity,
      ProductRatingEntity,
      VideoEntity,
      ScanEntity,
      UserEntity,
      IngredientEntity,
      OrderEntity,
    ]),
  ],
  controllers: [
    AppController,
    DevicesController,
    RecipesController,
    ProductsController,
    VideosController,
    ScansController,
    SystemController,
    UploadsController,
    IngredientsController,
  ],
  providers: [
    AppService,
    DevicesService,
    RecipesService,
    ProductsService,
    VideosService,
    ScansService,
    UploadsService,
    IngredientsService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}