import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'; 

@Entity()
export class ProductUnit {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column()
  name?: string;

  @ApiProperty({ default: '1' })
  @Column({ default: '1' })
  active?: string;
}
