import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { FastifyRequest } from 'fastify';
import { UserGroup } from '../user-groups/entities/user-group.entity';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    await this.userRepository.save(newUser);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['userGroup', 'branch'],
    });
  }

  async findAll(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const { search, branchId, active, page, pageSize } = req.body as any;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder.select([
      'user.id',
      'user.username',
      'user.name',
      'user.lastname',
      'user.tel',
      'user.bookno',
      'user.bookbank',
      'user.bookname',
      'user.type',
    ]);

    if (user.userGroup.type !== 'ผู้ดูแลระบบ') {
      queryBuilder.andWhere('user.type IN (:...types)', {
        types: ['พนักงาน', 'admin-external', 'ไฟแนนซ์', 'ลูกค้า'],
      });
    }

    if (branchId !== 0) {
      queryBuilder.andWhere('user.branchId = :branchId', {
        branchId: branchId,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.username ILIKE :search OR user.bookbank ILIKE :search OR user.tel ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (active !== '2') {
      queryBuilder.andWhere('user.active = :active', {
        active: active,
      });
    }

    queryBuilder
      .leftJoin('user.userGroup', 'userGroup')
      .addSelect('userGroup.name')
      .leftJoin('user.branch', 'branch')
      .addSelect('branch.name');

    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    // Log the generated query for debugging purposes
    // console.log(queryBuilder.getSql());

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      total,
      page: page,
      pageSize: pageSize,
    };
  }

  async findOne(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      delete user.password;
      delete user.refreshToken;
      return user;
    }
    return undefined;
  }

  async findOneByCustomerId(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { customerId: id },
    });
    if (user) {
      delete user.password;
      delete user.refreshToken;
      return user;
    }
    return undefined;
  }

  /**
   * Finds all users associated with a given list of customer IDs.
   * @param customerIds An array of customer IDs.
   * @returns A promise that resolves to an array of users.
   */
  public async findUsersByCustomerIds(customerIds: number[]): Promise<User[]> {
    if (!customerIds || customerIds.length === 0) {
      return [];
    }
    return this.userRepository.find({
      where: {
        // Use the In operator to find all records where customerId is in the provided array
        customerId: In(customerIds),
      },
      // Select only the field we need for the check to be more efficient
      select: ['customerId'],
    });
  }

  async saveTokenFirebase(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;
    if (user) {
      const { token } = req.body as any;

      if (user.type == 'ลูกค้า') {
        await this.userRepository.update(user.id, {
          firebaseToken: token,
        });
      }
    }
  }

  async findUser(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const fetchUser = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.customer', 'customer')
      .leftJoinAndSelect('user.branch', 'branch')
      .select([
        'user.id',
        'customer.id',
        'customer.citizenIdCard',
        'customer.code',
        'customer.name',
        'customer.lastname',
        'customer.tel',
        'branch.facebook',
        'branch.lineOa',
        'branch.googlemaps',
      ])
      .where('user.id = :id', { id: user.id })
      .getOne();
    if (fetchUser) {
      return fetchUser;
    }
    return undefined;
  }

  async findOneWithRelations(
    options: FindOneOptions<User>,
  ): Promise<User | undefined> {
    const user = await this.userRepository.findOne(options);
    if (user) {
      delete user.password;
      return user;
    }
    return undefined;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    } else {
      delete updateUserDto.password;
    }

    // จัดการ userGroupId และ type (ถ้าต้องการควบคุม)
    if (
      updateUserDto.userGroupId &&
      updateUserDto.userGroupId !== user.userGroupId
    ) {
      const userGroup = await this.userGroupRepository.findOne({
        where: { id: updateUserDto.userGroupId },
      });
      if (userGroup) {
        updateUserDto.userGroupId = updateUserDto.userGroupId;
        updateUserDto.type = userGroup.type; // อัพเดต type เฉพาะเมื่อเปลี่ยน userGroupId
      }
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }

  async updateRefreshToken(
    id: number,
    updateUserDto: Partial<User>,
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    // อัพเดตเฉพาะ field ที่ส่งมาเท่านั้น
    const updateData: Partial<User> = {};

    // จัดการ refreshToken
    if (updateUserDto.refreshToken) {
      updateData.refreshToken = updateUserDto.refreshToken;
    }

    // อัพเดตเฉพาะ field ที่กำหนด
    await this.userRepository.update(id, updateData);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
