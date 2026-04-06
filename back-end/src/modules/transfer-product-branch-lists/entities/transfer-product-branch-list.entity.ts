import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TransferProductBranch } from 'src/modules/transfer-product-branch/entities/transfer-product-branch.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity()
export class TransferProductBranchList {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  amount?: number;

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
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  priceSale: number;

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
  transferProductBranchId?: number;

  @ManyToOne(() => TransferProductBranch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'transferProductBranchId' })
  transferProductBranch?: TransferProductBranch;
}
