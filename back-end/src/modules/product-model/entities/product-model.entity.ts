import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ProductModel {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column()
  name?: string;

  @ApiProperty({ type: [String], default: [] })
  @Column('text', { array: true, default: '{}' })
  catalog?: string[];

  @ApiProperty({ default: '1' })
  @Column()
  active?: string;
}
