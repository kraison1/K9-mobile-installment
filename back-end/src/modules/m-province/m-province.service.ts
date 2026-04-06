import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MProvinceSearchDto } from 'src/helper/search.dto';
import { Repository } from 'typeorm';
import { CreateMProvinceDto } from './dto/create-m-province.dto';
import { UpdateMProvinceDto } from './dto/update-m-province.dto';
import { MProvince } from './entities/m-province.entity';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class MProvinceService {
  constructor(
    @InjectRepository(MProvince)
    private readonly MProvinceRepository: Repository<MProvince>,
  ) {}

  async create(createMProvinceDto: CreateMProvinceDto): Promise<any> {
    const newMProvince = this.MProvinceRepository.create(createMProvinceDto);

    await this.MProvinceRepository.save(newMProvince);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newMProvince.name}`,
    };
  }

  async findAll(searchMProvinceDto: MProvinceSearchDto): Promise<{
    data: MProvince[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.MProvinceRepository.createQueryBuilder('m_province');

    if (searchMProvinceDto.search) {
      queryBuilder.where('m_province.name ILIKE :search', {
        search: `%${searchMProvinceDto.search}%`,
      });
    }

    // if (searchMProvinceDto.active !== '2') {
    //   queryBuilder.andWhere('m_province.active = :active', {
    //     active: searchMProvinceDto.active,
    //   });
    // }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('m_province.name', 'ASC')
      .skip((searchMProvinceDto.page - 1) * searchMProvinceDto.pageSize)
      .take(searchMProvinceDto.pageSize);

    const MProvinces = await queryBuilder.getMany();

    return {
      data: MProvinces,
      total,
      page: searchMProvinceDto.page,
      pageSize: searchMProvinceDto.pageSize,
    };
  }

  async getSelect(): Promise<Pick<MProvince, 'id' | 'name'>[]> {
    return this.MProvinceRepository.find({
      select: ['id', 'name'],
    });
  }

  async findOne(id: number): Promise<MProvince | null> {
    return this.MProvinceRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateMProvinceDto: UpdateMProvinceDto,
  ): Promise<any> {
    await this.MProvinceRepository.update(id, updateMProvinceDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${updateMProvinceDto.name}`,
    };
  }
}
