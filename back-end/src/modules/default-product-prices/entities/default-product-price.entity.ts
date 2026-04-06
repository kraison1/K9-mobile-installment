import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class DefaultProductPrice {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  label?: string;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  value?: number;

  @ApiProperty({ default: '1' })
  @Column()
  active?: string;
}
