import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Bank {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 'B1' })
  @Column({ default: 'B1' })
  bankName?: string;

  @ApiProperty({ default: '' })
  @Column()
  bankNo?: string;

  @ApiProperty({ default: '' })
  @Column()
  bankOwner?: string;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  priceAll?: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  branchId?: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  priceLimit?: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  priceCurrent?: number;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  isFirstTransfer?: string;

  @ApiProperty({ default: '[]' })
  @Column({ type: 'jsonb', default: '[]' }) // Use jsonb type for storing JSON array
  bookType?: string[];

  @ApiProperty({ default: '1' })
  @Column()
  active?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileBank?: string;
}
