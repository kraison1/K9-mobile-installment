import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class RateFinance {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column()
  name?: string;

  @ApiProperty({ default: 1 })
  @Column({ default: 1 })
  valueMonth?: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valueEqual?: number;

  @ApiProperty({ default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  percentCommission?: number;

  @ApiProperty({ default: '0' })
  @Column({ default: '0' })
  maximumRental?: string;

  @ApiProperty({ default: '1' })
  @Column()
  active?: string;
}
