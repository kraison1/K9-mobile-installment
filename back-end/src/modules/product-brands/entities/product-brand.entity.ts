import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ProductBrand {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column()
  code?: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  fileProductBrand?: string;

  @ApiProperty({ default: '' })
  @Column()
  name?: string;

  @ApiProperty({ type: [String], default: [] })
  @Column('text', { array: true, default: '{}' })
  catalog?: string[];

  @ApiProperty({ default: '1' })
  @Column()
  active?: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  showStock?: string;
}
