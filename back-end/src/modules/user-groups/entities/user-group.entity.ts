import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'; 

@Entity()
export class UserGroup {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: '' })
  @Column()
  name?: string;

  @ApiProperty({ default: '[]' })
  @Column({ type: 'jsonb', default: '[]' }) // Use jsonb type for storing JSON array
  permissions: string[];

  @ApiProperty({ default: 'พนักงาน' })
  @Column({ default: 'พนักงาน' })
  type?: string;

  @ApiProperty({ default: '1' })
  @Column()
  active?: string;
}
