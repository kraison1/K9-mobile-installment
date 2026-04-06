import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Auth {
  @ApiProperty({ default: '' })
  @Column({ default: '' })
  username?: string;

  @ApiProperty({ default: '' })
  @Column()
  password?: string;

  @ApiProperty({ default: '' })
  @Column()
  refreshToken?: string;

  @ApiProperty({ default: '' })
  @Column()
  deviceType?: string;
}
