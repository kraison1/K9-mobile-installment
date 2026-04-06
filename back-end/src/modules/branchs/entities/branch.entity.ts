import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({ default: 'B1' })
  @Column({ default: 'B1' })
  code?: string;

  @ApiProperty({ default: '' })
  @Column()
  name?: string;

  @ApiProperty({ default: '' })
  @Column({ default: 300 })
  priceBranchService?: number;

  @ApiProperty({ default: '' })
  @Column({ default: 50 })
  valueFollowOneMonth?: number;

  @ApiProperty({ default: 0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 10,
    nullable: true,
  })
  percentWage?: number;

  @ApiProperty({ default: '' })
  @Column({ default: 100 })
  valueFollowMoreThanMonth?: number;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  ownerBank?: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  ownerBankName?: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  ownerBankNo?: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  ownerName?: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  nameRefOne?: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  nameRefTwo?: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  ownerIdCard?: string;

  @ApiProperty({ default: '' })
  @Column({ nullable: true })
  ownerAddress?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  token_bot?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  room_id_daylily_mobile?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  room_id_daylily_accessibility?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  room_id_sale_daylily_mobile?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  room_id_sale_daylily_accessibility?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  room_id_sale_cash?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  room_id_processCases?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  room_id_processBook?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  room_id_processSaving?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  room_id_lockAppleId?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  room_id_unlockAppleId?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  room_id_paymentDown?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  room_id_buyProduct?: string;

  @ApiProperty({ default: '1' })
  @Column()
  online?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  facebook?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  lineOa?: string;

  @ApiProperty({ default: '' })
  @Column({ default: '', nullable: true })
  googlemaps?: string;

  @ApiProperty({ default: '0' })
  @Column({ default: '0' })
  isCheckOcr?: string;

  @ApiProperty({ default: '0' })
  @Column({ default: '0' })
  isBranchDown?: string;

  @ApiProperty({ default: '1' })
  @Column()
  active?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileBranch?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileSignatureOwner?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileSignatureRefOne?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileSignatureRefTwo?: string;
}
