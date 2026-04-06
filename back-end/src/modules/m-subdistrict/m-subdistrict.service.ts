import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSubdistrictSearchDto } from 'src/helper/search.dto';
import { Repository } from 'typeorm';
import { CreateMSubdistrictDto } from './dto/create-m-subdistrict.dto';
import { UpdateMSubdistrictDto } from './dto/update-m-subdistrict.dto';
import { MSubdistrict } from './entities/m-subdistrict.entity';
import { MESSAGE_SAVE_SUCCESS, MESSAGE_UPDATE_SUCCESS } from 'src/helper/constanc';

@Injectable()
export class MSubdistrictService {
  constructor(
    @InjectRepository(MSubdistrict)
    private readonly MSubdistrictRepository: Repository<MSubdistrict>,
  ) {}

  async create(createMSubdistrictDto: CreateMSubdistrictDto): Promise<any> {
    const newMSubdistrict = this.MSubdistrictRepository.create(
      createMSubdistrictDto,
    );
    await this.MSubdistrictRepository.save(newMSubdistrict);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newMSubdistrict.name}`,
    };
  }

  async findAll(searchMSubdistrictDto: MSubdistrictSearchDto): Promise<{
    data: MSubdistrict[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.MSubdistrictRepository.createQueryBuilder('m_subdistrict');

    queryBuilder
      .select(['m_subdistrict'])
      .leftJoinAndSelect('m_subdistrict.district', 'district');

    if (searchMSubdistrictDto.search) {
      queryBuilder.where('m_subdistrict.name ILIKE :search', {
        search: `%${searchMSubdistrictDto.search}%`,
      });
    }

    // if (searchMProvinceDto.active !== '2') {
    //   queryBuilder.andWhere('m_province.active = :active', {
    //     active: searchMProvinceDto.active,
    //   });
    // }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('m_subdistrict.name', 'ASC')
      .skip((searchMSubdistrictDto.page - 1) * searchMSubdistrictDto.pageSize)
      .take(searchMSubdistrictDto.pageSize);

    const MSubdistricts = await queryBuilder.getMany();

    return {
      data: MSubdistricts,
      total,
      page: searchMSubdistrictDto.page,
      pageSize: searchMSubdistrictDto.pageSize,
    };
  }

  async getSelect(
    districtId: number,
  ): Promise<Pick<MSubdistrict, 'id' | 'name' | 'districtId' | 'postcode'>[]> {
    return this.MSubdistrictRepository.find({
      where: { districtId: districtId },
      select: ['id', 'name', 'districtId', 'postcode'],
    });
  }

  async findOne(id: number): Promise<MSubdistrict | null> {
    return this.MSubdistrictRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateMSubdistrictDto: UpdateMSubdistrictDto,
  ): Promise<any> {
    await this.MSubdistrictRepository.update(id, updateMSubdistrictDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${updateMSubdistrictDto.name}`,
    };
  }
}
