import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductUnit } from 'src/modules/product-units/entities/product-unit.entity';

@Entity()
export class ProductType {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column()
  name?: string;

  @ApiProperty({ default: 'มือถือ' })
  @Column({ default: 'มือถือ' })
  catalog?: string;

  @ApiProperty({ default: '' })
  @Column()
  productUnitId: number;

  @ManyToOne(() => ProductUnit, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productUnitId' })
  productUnit: ProductUnit;

  @ApiProperty({ default: '1' })
  @Column()
  active?: string;
}
