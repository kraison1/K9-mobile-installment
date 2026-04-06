import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductModel } from 'src/modules/product-model/entities/product-model.entity';
import { ProductStorage } from 'src/modules/product-storages/entities/product-storage.entity';

@Entity()
export class PercentDownFinance {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  productModelId: number;

  @ManyToOne(() => ProductModel, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productModelId' })
  productModel?: ProductModel;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  productStorageId: number;

  @ManyToOne(() => ProductStorage, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productStorageId' })
  productStorage?: ProductStorage;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  percentDown?: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceDownPayment?: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceCommission?: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  payPerMonth?: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  priceHandOne: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  priceStartHandTwo: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  priceEndHandTwo: number;

  @ApiProperty({ default: '0' })
  @Column({ default: '0' })
  isPromotions?: string;

  @ApiProperty({ default: '1' })
  @Column()
  active?: string;
}
