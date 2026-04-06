import { Injectable } from '@nestjs/common';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroup } from './entities/user-group.entity';
import { In, Repository } from 'typeorm';
import { UserGroupSearchDto } from 'src/helper/search.dto';
import { RedisService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { User } from '../users/entities/user.entity';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class UserGroupsService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly userGroupsRepository: Repository<UserGroup>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserGroupDto: CreateUserGroupDto): Promise<any> {
    const newUserGroup = this.userGroupsRepository.create(createUserGroupDto);
    await this.userGroupsRepository.save(newUserGroup);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(userGroupSearchDto: UserGroupSearchDto): Promise<{
    data: any[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.userGroupsRepository.createQueryBuilder('user_group');

    queryBuilder.select(['user_group.*']);

    if (userGroupSearchDto.search) {
      queryBuilder.where('user_group.name ILIKE :search', {
        search: `%${userGroupSearchDto.search}%`,
      });
    }

    if (userGroupSearchDto.active !== '2') {
      queryBuilder.andWhere('user_group.active = :active', {
        active: userGroupSearchDto.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('user_group.name', 'ASC')
      .skip((userGroupSearchDto.page - 1) * userGroupSearchDto.pageSize)
      .take(userGroupSearchDto.pageSize);

    const productStorages = await queryBuilder.getRawMany();

    return {
      data: productStorages,
      total,
      page: userGroupSearchDto.page,
      pageSize: userGroupSearchDto.pageSize,
    };
  }

  async getSelect(
    req: FastifyRequest,
  ): Promise<Pick<UserGroup, 'id' | 'name' | 'type'>[]> {
    const user = (req as any).user;

    if (user.userGroup.type !== 'ผู้ดูแลระบบ') {
      return this.userGroupsRepository.find({
        where: {
          active: '1',
          type: In(['พนักงาน', 'admin-external', 'ไฟแนนซ์', 'ลูกค้า']),
        },
        select: ['id', 'name', 'type'],
      });
    } else {
      return this.userGroupsRepository.find({
        where: { active: '1' },
        select: ['id', 'name', 'type'],
      });
    }
  }

  async findOne(id: number): Promise<UserGroup | null> {
    return this.userGroupsRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateUserGroupDto: UpdateUserGroupDto,
  ): Promise<any> {
    const userGroup = await this.userGroupsRepository.findOne({
      where: { id },
    });

    if (userGroup.type !== updateUserGroupDto.type) {
      await this.userRepository.update(
        { userGroupId: id },
        { type: updateUserGroupDto.type },
      );
    }

    await this.userGroupsRepository.update(id, updateUserGroupDto);
    const updatedGroup = await this.userGroupsRepository.findOne({
      where: { id },
    });

    if (updatedGroup && this.redisService.isInitialized()) {
      const cacheKey = `${this.configService.get<string>('REDIS_PERMISSION_KEY')}${id}`; // ใช้จาก .env
      const permissions = updatedGroup.permissions || [];
      await this.redisService.set(cacheKey, JSON.stringify(permissions), 3600); // TTL 1 ชม.
    }

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
