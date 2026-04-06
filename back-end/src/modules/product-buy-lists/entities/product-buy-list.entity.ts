import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';
import { ProductBuy } from 'src/modules/product-buy/entities/product-buy.entity';

@Entity()
export class ProductBuyLists {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  amount?: number;

  @ApiProperty()
  @Column()
  productName?: string;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceSumCostBuy: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceCostBuy: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  productId?: number;

  @ManyToOne(() => Product, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  productBuyId?: number;

  @ManyToOne(() => ProductBuy, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productBuyId' })
  productBuy?: ProductBuy;
}
