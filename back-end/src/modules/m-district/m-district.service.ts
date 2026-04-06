import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MDistrictSearchDto } from 'src/helper/search.dto';
import { Repository } from 'typeorm';
import { CreateMDistrictDto } from './dto/create-m-district.dto';
import { UpdateMDistrictDto } from './dto/update-m-district.dto';
import { MDistrict } from './entities/m-district.entity';
import { MESSAGE_SAVE_SUCCESS, MESSAGE_UPDATE_SUCCESS } from 'src/helper/constanc';

@Injectable()
export class MDistrictService {
  constructor(
    @InjectRepository(MDistrict)
    private readonly MDistrictRepository: Repository<MDistrict>,
  ) {}

  async create(createMDistrictDto: CreateMDistrictDto): Promise<any> {
    const newMDistrict = this.MDistrictRepository.create(createMDistrictDto);
    await this.MDistrictRepository.save(newMDistrict);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newMDistrict.name}`,
    };
  }

  async findAll(searchMDistrictDto: MDistrictSearchDto): Promise<{
    data: MDistrict[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.MDistrictRepository.createQueryBuilder('m_district');

    queryBuilder
      .select(['m_district'])
      .leftJoinAndSelect('m_district.province', 'province');

    if (searchMDistrictDto.search) {
      queryBuilder.where('m_district.name ILIKE :search', {
        search: `%${searchMDistrictDto.search}%`,
      });
    }

    // if (searchMProvinceDto.active !== '2') {
    //   queryBuilder.andWhere('m_province.active = :active', {
    //     active: searchMProvinceDto.active,
    //   });
    // }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('m_district.name', 'ASC')
      .skip((searchMDistrictDto.page - 1) * searchMDistrictDto.pageSize)
      .take(searchMDistrictDto.pageSize);

    const MDistricts = await queryBuilder.getMany();

    return {
      data: MDistricts,
      total,
      page: searchMDistrictDto.page,
      pageSize: searchMDistrictDto.pageSize,
    };
  }

  async getSelect(
    provinceId: number,
  ): Promise<Pick<MDistrict, 'id' | 'name' | 'provinceId'>[]> {
    return this.MDistrictRepository.find({
      where: { provinceId: provinceId },
      select: ['id', 'name', 'provinceId'],
    });
  }

  async findOne(id: number): Promise<MDistrict | null> {
    return this.MDistrictRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateMDistrictDto: UpdateMDistrictDto,
  ): Promise<any> {
    await this.MDistrictRepository.update(id, updateMDistrictDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${updateMDistrictDto.name}`,
    };
  }
}
