import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRateFinanceDto } from './dto/create-rate-finance.dto';
import { UpdateRateFinanceDto } from './dto/update-rate-finance.dto';
import { RateFinance } from './entities/rate-finance.entity';
import { RateFinanceSearchDto } from 'src/helper/search.dto';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class RateFinanceService {
  constructor(
    @InjectRepository(RateFinance)
    private readonly rateFinanceRepository: Repository<RateFinance>,
  ) {}

  async create(createRateFinanceDto: CreateRateFinanceDto): Promise<any> {
    const newRateFinance =
      this.rateFinanceRepository.create(createRateFinanceDto);
    await this.rateFinanceRepository.save(newRateFinance);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(searchDto: RateFinanceSearchDto): Promise<{
    data: RateFinance[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.rateFinanceRepository.createQueryBuilder('rate_finance');

    if (searchDto.search) {
      queryBuilder.andWhere('rate_finance.name ILIKE :search', {
        search: `%${searchDto.search}%`,
      });
    }

    if (searchDto.active !== '2') {
      queryBuilder.andWhere('rate_finance.active = :active', {
        active: searchDto.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('rate_finance.valueMonth', 'ASC')
      .skip((searchDto.page - 1) * searchDto.pageSize)
      .take(searchDto.pageSize);

    const rateFinances = await queryBuilder.getMany();

    return {
      data: rateFinances,
      total,
      page: searchDto.page,
      pageSize: searchDto.pageSize,
    };
  }

  async getSelect(): Promise<
    Pick<
      RateFinance,
      'id' | 'name' | 'valueMonth' | 'maximumRental' | 'valueEqual'
    >[]
  > {
    return this.rateFinanceRepository.find({
      where: { active: '1' },
      select: ['id', 'name', 'valueMonth', 'maximumRental', 'valueEqual'],
      order: { valueMonth: 'asc' },
    });
  }

  async findOne(id: number): Promise<RateFinance | null> {
    return this.rateFinanceRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateRateFinanceDto: UpdateRateFinanceDto,
  ): Promise<any> {
    await this.rateFinanceRepository.update(id, updateRateFinanceDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
