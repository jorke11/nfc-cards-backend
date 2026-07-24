import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardOrder } from '../entities/card-order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([CardOrder])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
