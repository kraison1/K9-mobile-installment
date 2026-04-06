import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';
import { ProductRepair } from 'src/modules/product-repair/entities/product-repair.entity';

@Entity()
export class ProductRepairList {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty()
  @Column()
  productName?: string;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  amount: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  productId: number;

  @ManyToOne(() => Product, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  isFree: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  buyFormShop: string;

  @ApiProperty({ default: 'อุปกรณ์เสริม' })
  @Column({ default: 'อุปกรณ์เสริม' })
  catalog: string;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  priceCostBuy?: Date;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  priceSale: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceProfit: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  productRepairId?: number;

  @ManyToOne(() => ProductRepair, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productRepairId' })
  productRepair?: ProductRepair;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;
}
