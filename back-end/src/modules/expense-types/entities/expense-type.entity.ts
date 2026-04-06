import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'; //

@Entity()
export class ExpenseType {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  code?: string;

  @ApiProperty({ default: '' })
  @Column()
  name?: string;

  @ApiProperty({ default: '1' })
  @Column()
  type?: string;

  @ApiProperty({ default: '1' })
  @Column()
  active?: string;
}
