import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class LatestNew {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  name?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '' })
  content?: string;

  @ApiProperty({ default: null })
  @Column({ default: null, nullable: true })
  linkUrl?: string;

  @ApiProperty({ default: '1' })
  @Column()
  active?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileLatestNew?: string;
}
