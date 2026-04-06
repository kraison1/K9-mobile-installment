import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity()
export class Ocr {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  code: string;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  productId: number;

  @ManyToOne(() => Product, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  branchId?: number;

  @ManyToOne(() => Branch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;

  @ApiProperty({ default: 1 })
  @Column({ default: 1, nullable: true })
  createByUserId: number;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'createByUserId' })
  create_by?: User;

  @ApiProperty({ default: 1 })
  @Column({ nullable: true })
  updateByUserId: number;

  @ApiProperty({ default: () => 'CURRENT_TIMESTAMP' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_date?: Date;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileOcr?: string;

  @Column({ nullable: true }) // Field สำหรับเก็บ barcode
  barcode: string;

  @Column({ nullable: true }) // เพิ่ม field สำหรับเก็บ IMEI
  imei: string;
}
