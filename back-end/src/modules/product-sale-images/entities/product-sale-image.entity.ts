import { ApiProperty } from '@nestjs/swagger';
import { ProductSale } from 'src/modules/product-sale/entities/product-sale.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class ProductSaleImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  name: string;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  productSaleId: number;

  @ManyToOne(() => ProductSale, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productSaleId' })
  productSale?: ProductSale;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  type: string;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  userId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;
}
