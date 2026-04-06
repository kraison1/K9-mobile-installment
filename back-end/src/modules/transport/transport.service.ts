import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransportDto } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';
import { Transport } from './entities/transport.entity';
import { TransportSearchDto } from 'src/helper/search.dto';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class TransportService {
  constructor(
    @InjectRepository(Transport)
    private readonly transportRepository: Repository<Transport>,
  ) {}

  async create(createTransportDto: CreateTransportDto): Promise<any> {
    const newTransport = this.transportRepository.create(createTransportDto);
    await this.transportRepository.save(newTransport);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(searchDto: TransportSearchDto): Promise<{
    data: Transport[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.transportRepository.createQueryBuilder('transport');

    if (searchDto.search) {
      queryBuilder.where('transport.name ILIKE :search', {
        search: `%${searchDto.search}%`,
      });
    }

    if (searchDto.active !== '2') {
      queryBuilder.andWhere('transport.active = :active', {
        active: searchDto.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('transport.name', 'ASC')
      .skip((searchDto.page - 1) * searchDto.pageSize)
      .take(searchDto.pageSize);

    const transports = await queryBuilder.getMany();

    return {
      data: transports,
      total,
      page: searchDto.page,
      pageSize: searchDto.pageSize,
    };
  }

  async getSelect(): Promise<Pick<Transport, 'id' | 'name'>[]> {
    return this.transportRepository.find({
      where: { active: '1' },
      select: ['id', 'name'],
    });
  }

  async findOne(id: number): Promise<Transport | null> {
    return this.transportRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateTransportDto: UpdateTransportDto,
  ): Promise<any> {
    await this.transportRepository.update(id, updateTransportDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
