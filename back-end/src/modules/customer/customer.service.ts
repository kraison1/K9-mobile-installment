import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, ILike, In, Not, Repository, DataSource } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerSearchDto } from 'src/helper/search.dto';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import dayjs from 'src/configs/dayjs-config';
import { isEmpty, values } from 'lodash';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { CustomerImage } from '../customer-image/entities/customer-image.entity';
import {
  MESSAGE_DELETE_SUCCESS,
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
  MESSAGE_WAITING,
} from 'src/helper/constanc';
import { generateRandomString } from 'src/helper/generateRandomString';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { formatPhoneNumber, trimString } from 'src/helper/transformValue';
import { ProductService } from '../product/product.service';
import { UserService } from '../users/users.service';
import { UserGroup } from '../user-groups/entities/user-group.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
@Injectable()
export class CustomerService {
  private readonly uploadsPath = path.join('uploads/customers');

  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(CustomerImage)
    private readonly customerImageRepository: Repository<CustomerImage>,
    @InjectRepository(ProductSale)
    private readonly productSaleRepository: Repository<ProductSale>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    private productService: ProductService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);

    const files = await req.saveRequestFiles();

    const {
      citizenIdCard,
      customerType,
      name,
      lastname,
      tel,
      facebook,
      nameRefOne,
      lastnameRefOne,
      relaRefOne,
      telRefOne,
      nameRefTwo,
      lastnameRefTwo,
      relaRefTwo,
      telRefTwo,
      googleMap,
      address,
      mProvinceId,
      mDistrictId,
      mSubdistrictId,
      zipCode,

      idCardAddress,
      idCardProvinceId,
      idCardDistrictId,
      idCardSubdistrictId,
      idCardZipCode,

      active,
      fileCustomer,
    } = req.body as any;

    const createCustomerDto = {
      // citizenIdCard: citizenIdCard?.value ?? null,
      citizenIdCard: trimString(citizenIdCard?.value ?? null),
      customerType: customerType?.value ?? null,
      name: name?.value ?? null,
      lastname: lastname?.value ?? null,
      tel: formatPhoneNumber(tel?.value ?? null),
      facebook: facebook?.value ?? null,
      nameRefOne: nameRefOne?.value ?? null,
      lastnameRefOne: lastnameRefOne?.value ?? null,
      relaRefOne: relaRefOne?.value ?? null,
      telRefOne: telRefOne?.value ?? null,
      nameRefTwo: nameRefTwo?.value ?? null,
      lastnameRefTwo: lastnameRefTwo?.value ?? null,
      relaRefTwo: relaRefTwo?.value ?? null,
      telRefTwo: telRefTwo?.value ?? null,
      googleMap: googleMap?.value ?? null,
      branchId: user.branchId,

      address: address?.value ?? null,
      mProvinceId: mProvinceId?.value ?? null,
      mDistrictId: mDistrictId?.value ?? null,
      mSubdistrictId: mSubdistrictId?.value ?? null,
      zipCode: zipCode?.value ?? null,

      idCardAddress: idCardAddress?.value ?? null,
      idCardProvinceId: idCardProvinceId?.value ?? null,
      idCardDistrictId: idCardDistrictId?.value ?? null,
      idCardSubdistrictId: idCardSubdistrictId?.value ?? null,
      idCardZipCode: idCardZipCode?.value ?? null,

      active: active?.value ?? true,
      fileCustomer: fileCustomer?.value ?? null,
      createByUserId: user.id,
    };

    const checkCitizen = await this.customerRepository.findOne({
      where: { citizenIdCard: createCustomerDto.citizenIdCard },
    });

    if (createCustomerDto.citizenIdCard != 0) {
      if (!isEmpty(checkCitizen)) {
        return {
          message_error: `บัตรประขาชนซ้ำ : ${checkCitizen.name} ${checkCitizen.lastname}`,
        };
      }
    }

    const branch = await this.branchRepository.findOne({
      where: { id: createCustomerDto.branchId },
    });

    let customerCode: string;
    if (createCustomerDto.customerType == '4') {
      // For resellers (ตัวแทนจำหน่าย), the prefix is 'A' followed by a running number.
      const prefix = `A`;
      const latestReseller = await this.customerRepository
        .createQueryBuilder('customer')
        .where('customer.code ILIKE :code', { code: `${prefix}%` })
        .andWhere('customer.customerType = :type', { type: '4' })
        .orderBy('customer.code', 'DESC')
        .getOne();

      let runNumber = '0001';
      if (latestReseller) {
        const latestRunNumber = parseInt(latestReseller.code.slice(1), 10);
        runNumber = (latestRunNumber + 1).toString().padStart(4, '0');
      }
      customerCode = `${prefix}${runNumber}`;
    } else {
      // For other customers, the prefix includes branch code and date.
      const currentDate = dayjs().format('YYYYMMDD');
      const prefix = `V${branch.code}${currentDate}`;

      const latestCustomer = await this.customerRepository
        .createQueryBuilder('customer')
        .where('customer.branchId = :branchId', { branchId: branch.id })
        .andWhere('customer.code ILIKE :code', { code: `${prefix}%` })
        .orderBy('customer.code', 'DESC')
        .getOne();

      let runNumber = '0001';
      if (latestCustomer) {
        const latestRunNumber = parseInt(latestCustomer.code.slice(-4), 10);
        runNumber = (latestRunNumber + 1).toString().padStart(4, '0');
      }
      customerCode = `${prefix}${runNumber}`;
    }

    const newCustomer = this.customerRepository.create({
      ...createCustomerDto,
      code: customerCode,
    });

    await this.customerRepository.save(newCustomer);

    if (
      createCustomerDto.customerType === '1' &&
      createCustomerDto.citizenIdCard.length === 13
    ) {
      const customerUserGroup = await this.userGroupRepository.findOne({
        where: { type: 'ลูกค้า' },
      });

      if (customerUserGroup) {
        if (process.env.SYSTEM_BY == 'THUNDER') {
          const branchDown = await this.branchRepository.findOne({
            where: { isBranchDown: '1' },
          });
          newCustomer.branchId = branchDown.id;
        }

        const createUserDtoForCustomer: CreateUserDto = {
          username: createCustomerDto.citizenIdCard,
          password: (createCustomerDto.tel || '').replace(/-/g, ''),
          name: createCustomerDto.name,
          lastname: createCustomerDto.lastname,
          tel: createCustomerDto.tel,
          branchId: newCustomer.branchId,
          bookbank: '',
          bookname: '',
          bookno: '',
          refreshToken: '',
          userGroupId: customerUserGroup.id,
          type: 'ลูกค้า',
          active: '1',
          deviceType: 'mobile',
          customerId: newCustomer.id,
        };
        try {
          await this.userService.create(createUserDtoForCustomer);
        } catch (error) {
          // Log the error, but don't fail the customer creation.
          console.error(
            `Failed to create user for customer ${newCustomer.code}:`,
            error,
          );
        }
      } else {
        console.warn(
          'User group "ลูกค้า" not found. Skipping user creation for customer.',
        );
      }
    }

    if (files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${newCustomer.code}`);
      const imagePromises = files.map(async (file, index) => {
        const randomName = generateRandomString(6);
        const filename = `${randomName}-${index + 1}.png`;
        const filePath = path.join(
          `${this.uploadsPath}/${newCustomer.code}`,
          filename,
        );

        // Stream file processing with Sharp to reduce memory usage
        const readStream = fs.createReadStream(file.filepath);
        const writeStream = fs.createWriteStream(filePath);
        const sharpStream = sharp()
          .png({ quality: 80, progressive: true }) // Progressive PNG for faster rendering
          .on('error', (err) => {
            throw err;
          });

        await new Promise<void>((resolve, reject) => {
          readStream
            .pipe(sharpStream)
            .pipe(writeStream)
            .on('finish', resolve)
            .on('error', reject);
        });

        return this.customerImageRepository.create({
          name: filePath,
          customerId: newCustomer.id,
          userId: createCustomerDto.createByUserId,
          seq: index + 1,
        });
      });

      const newImages = await Promise.all(imagePromises); // Parallelize image processing
      const savedImages = await this.customerImageRepository.save(newImages); // Batch save images

      if (savedImages.length > 0) {
        newCustomer.fileCustomer = savedImages[0].name;
      }

      // Clean up temporary files
      await Promise.all(
        files.map((file) => fs.unlink(file.filepath).catch(() => {})),
      );
    }

    const customer = await this.customerRepository.save(newCustomer);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newCustomer.code}`,
      data: await this.findOne(customer.id),
    };
  }

  async findAll(
    searchCustomerDto: CustomerSearchDto,
    req?: FastifyRequest,
  ): Promise<{
    data: Customer[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const user = (req as any).user;

    const qb = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.mProvince', 'mProvince')
      .leftJoinAndSelect('customer.mDistrict', 'mDistrict')
      .leftJoinAndSelect('customer.mSubdistrict', 'mSubdistrict')
      .leftJoinAndSelect('customer.idCardProvince', 'idCardProvince')
      .leftJoinAndSelect('customer.idCardDistrict', 'idCardDistrict')
      .leftJoinAndSelect('customer.idCardSubdistrict', 'idCardSubdistrict');

    // permissions
    const permissions = await this.productService.fetchPermission(user);

    if (!permissions.includes('view-all-customers')) {
      qb.where('customer.branchId = :branchId', {
        branchId: searchCustomerDto.branchId,
      });
    }

    if (user.type === 'admin-external' || user.type === 'ไฟแนนซ์') {
      qb.andWhere('customer.createByUserId = :userId', { userId: user.id });
    }

    if (searchCustomerDto.customerType !== '0') {
      qb.andWhere('customer.customerType = :customerType', {
        customerType: searchCustomerDto.customerType,
      });
    }

    if (searchCustomerDto.search) {
      qb.andWhere(
        `(
        customer.code ILIKE :search OR
        customer.name ILIKE :search OR
        customer.lastname ILIKE :search OR
        customer.tel ILIKE :search OR
        customer.citizenIdCard ILIKE :search
      )`,
        { search: `%${searchCustomerDto.search}%` },
      );
    }

    if (searchCustomerDto.active !== '2') {
      qb.andWhere('customer.active = :active', {
        active: searchCustomerDto.active,
      });
    }

    qb.orderBy('customer.create_date', 'ASC')
      .skip((searchCustomerDto.page - 1) * searchCustomerDto.pageSize)
      .take(searchCustomerDto.pageSize)
      .distinct(true); // กันแถวซ้ำจาก LEFT JOIN (ถ้ามี)

    // ได้ทั้งรายการและจำนวนรวมในครั้งเดียว
    const [customers, total] = await qb.getManyAndCount();

    return {
      data: customers,
      total,
      page: searchCustomerDto.page,
      pageSize: searchCustomerDto.pageSize,
    };
  }

  async getSelect(
    branchId: number,
    customerType: string,
    search?: string,
    req?: FastifyRequest,
  ): Promise<Customer[]> {
    const user = (req as any).user;

    const customerTypes = customerType.split(',');

    const query = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.active = :active', { active: '1' })
      .andWhere('customer.customerType IN (:...customerTypes)', {
        customerTypes,
      })
      // เพิ่มตรงนี้เพื่อไม่ให้ citizenIdCard ค่าว่างถูกแสดง
      .andWhere(
        `(customer.citizenIdCard IS NOT NULL AND customer.citizenIdCard <> '')`,
      );
    // -----------------------------------------------------------------

    const permissions = await this.productService.fetchPermission(user);

    if (
      !permissions.includes('view-all-branches') ||
      process.env.SYSTEM_BY == 'THUNDER'
    ) {
      if (!permissions.includes('view-all-branches')) {
        query.andWhere('customer.branchId = :branchId', { branchId });
      }
    }

    if (user.type == 'admin-external' || user.type == 'ไฟแนนซ์') {
      query.andWhere('customer.createByUserId = :userId', { userId: user.id });
    }

    if (!search || search.trim() === '' || search === 'null') {
      query.orderBy('RANDOM()').limit(50);
    } else {
      query.andWhere(
        `(
        customer.name ILIKE :search OR 
        customer.lastname ILIKE :search OR 
        customer.tel ILIKE :search OR 
        customer.id::text ILIKE :search OR 
        customer.citizenIdCard ILIKE :search OR 
        customer.code ILIKE :search
      )`,
        { search: `%${search.trim()}%` },
      );
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Customer | null> {
    // This block seems to be for data synchronization, creating user accounts for customers.
    // Running this inside `findOne` is highly inefficient as it runs for ALL customers every time one is fetched.
    // This logic should ideally be moved to a separate, scheduled task or a one-time migration script.
    // The following is an optimized version of the block, but moving it is the best solution.
    // const customerUserGroup = await this.userGroupRepository.findOne({
    //   where: { type: 'ลูกค้า' },
    // });

    // if (customerUserGroup) {
    //   // 1. Fetch all potentially valid customers at once
    //   const customersToProcess = await this.customerRepository.find({
    //     where: { active: '1', customerType: '1' },
    //     select: [
    //       'id',
    //       'citizenIdCard',
    //       'name',
    //       'lastname',
    //       'tel',
    //       'branchId',
    //       'code',
    //     ], // Select only necessary fields
    //   });

    //   const validCustomers = customersToProcess.filter(
    //     (c) => c.citizenIdCard && c.citizenIdCard.length === 13,
    //   );

    //   if (validCustomers.length > 0) {
    //     // 2. Check for existing users in a single batch to avoid creating duplicates
    //     const customerIds = validCustomers.map((c) => c.id);
    //     // Note: `findUsersByCustomerIds` is a new method in `UserService`
    //     // to efficiently find all users for the given customer IDs in one query.
    //     const existingUsers = await this.userService.findUsersByCustomerIds(customerIds);
    //     const existingCustomerIds = new Set(existingUsers.map((u) => u.customerId));

    //     const customersNeedingUsers = validCustomers.filter(
    //       (c) => !existingCustomerIds.has(c.id),
    //     );

    //     if (customersNeedingUsers.length > 0) {
    //       // 3. Fetch `branchDown` once outside the loop
    //       let branchDownId = null;
    //       if (process.env.SYSTEM_BY === 'THUNDER') {
    //         const branchDown = await this.branchRepository.findOne({
    //           where: { isBranchDown: '1' },
    //           select: ['id'],
    //         });
    //         if (branchDown) {
    //           branchDownId = branchDown.id;
    //         }
    //       }

    //       // 4. Create user accounts in batches to avoid overwhelming the database connection pool.
    //       const batchSize = 20; // Process 20 users at a time. Adjust as needed.
    //       for (let i = 0; i < customersNeedingUsers.length; i += batchSize) {
    //         const batch = customersNeedingUsers.slice(i, i + batchSize);
    //         const createUserPromises = batch.map((customer) => {
    //           const createUserDto: CreateUserDto = {
    //             username: customer.citizenIdCard,
    //             password: (customer.tel || '').replace(/-/g, ''),
    //             name: customer.name,
    //             lastname: customer.lastname,
    //             tel: customer.tel,
    //             branchId: branchDownId ?? customer.branchId,
    //             bookbank: '',
    //             bookname: '',
    //             bookno: '',
    //             refreshToken: '',
    //             userGroupId: customerUserGroup.id,
    //             type: 'ลูกค้า',
    //             active: '1',
    //             deviceType: 'mobile',
    //             customerId: customer.id,
    //           };
    //           return this.userService.create(createUserDto).catch((error) => {
    //             console.error(
    //               `Failed to create user for customer ${customer.code}:`,
    //               error.message,
    //             );
    //             return null; // Prevent one failure from stopping all others
    //           });
    //         });
    //         await Promise.all(createUserPromises);
    //       }
    //     }
    //   }
    // }

    return this.customerRepository.findOne({
      where: { id },
      relations: ['customerImages'],
      order: {
        customerImages: {
          seq: 'ASC',
        },
      },
    });
  }

  async searchCitizenIdCard(search: string): Promise<any> {
    const qb = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.productSale', 'productSale')
      .leftJoinAndSelect('customer.customerImages', 'customerImages')
      .orderBy('customerImages.seq', 'ASC')
      .where('customer.citizenIdCard = :number', {
        number: trimString(search),
      });

    if (search) {
      qb.orWhere('customer.name = :name OR customer.lastname = :lastname', {
        name: trimString(search),
        lastname: trimString(search),
      });
    }

    const customer = await qb.getOne();

    if (customer) {
      const pendingContracts = customer.productSale
        .filter((sale) => sale.isPaySuccess !== '1')
        .map((sale) => sale.code);

      if (pendingContracts.length > 0) {
        return {
          message_error: `ลูกค้ามีสัญญาที่ยังคงค้างในระบบ: ${pendingContracts}`,
        };
      }

      delete customer.productSale;
      return customer;
    }
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    // ปลอดภัย: กัน req.saveRequestFiles() ไม่มี / body ไม่มี
    await fs.ensureDir(this.uploadsPath);

    // NOTE: Fastify อาจไม่มีไฟล์เสมอไป
    const files =
      typeof (req as any).saveRequestFiles === 'function'
        ? await (req as any).saveRequestFiles()
        : [];

    // ---- Extract & sanitize body (คงรูปแบบเดิมไว้) --------------------------
    const body = (req.body as any) ?? {};
    const pickVal = (x: any) => x?.value ?? null;
    const trimStr = (x: any) => (x == null ? null : trimString(String(x)));

    const values = {
      citizenIdCard: trimStr(pickVal(body.citizenIdCard)),
      code: pickVal(body.code),
      customerType: pickVal(body.customerType),
      name: pickVal(body.name),
      lastname: pickVal(body.lastname),
      tel: formatPhoneNumber(pickVal(body.tel)),
      facebook: pickVal(body.facebook),
      nameRefOne: pickVal(body.nameRefOne),
      lastnameRefOne: pickVal(body.lastnameRefOne),
      relaRefOne: pickVal(body.relaRefOne),
      telRefOne: pickVal(body.telRefOne),
      nameRefTwo: pickVal(body.nameRefTwo),
      lastnameRefTwo: pickVal(body.lastnameRefTwo),
      relaRefTwo: pickVal(body.relaRefTwo),
      telRefTwo: pickVal(body.telRefTwo),
      googleMap: pickVal(body.googleMap),
      branchId: pickVal(body.branchId),
      address: pickVal(body.address),
      mProvinceId: pickVal(body.mProvinceId),
      mDistrictId: pickVal(body.mDistrictId),
      mSubdistrictId: pickVal(body.mSubdistrictId),
      zipCode: pickVal(body.zipCode),

      idCardAddress: pickVal(body.idCardAddress),
      idCardProvinceId: pickVal(body.idCardProvinceId),
      idCardDistrictId: pickVal(body.idCardDistrictId),
      idCardSubdistrictId: pickVal(body.idCardSubdistrictId),
      idCardZipCode: pickVal(body.idCardZipCode),

      active: body.active?.value ?? true,
      fileCustomer: pickVal(body.fileCustomer),
      createByUserId: pickVal(body.createByUserId),
      updateByUserId: pickVal(body.updateByUserId),
    };

    // กัน code ว่างเพราะใช้เป็นโฟลเดอร์
    if (!values.code || typeof values.code !== 'string') {
      return { message_error: 'รหัสลูกค้า (code) ไม่ถูกต้อง' };
    }

    // ---- ดึงข้อมูลเดิมมาเทียบ ------------------------------------------------
    const existingCustomer = await this.customerRepository.findOneBy({ id });
    if (!existingCustomer) {
      return { message_error: 'ไม่พบข้อมูลลูกค้า' };
    }

    // ---- ตรวจบัตรประชาชนซ้ำ (ยกเว้น id ปัจจุบัน) ---------------------------
    const checkCitizen = await this.customerRepository.findOne({
      where: {
        citizenIdCard: values.citizenIdCard,
        id: Not(Equal(id)),
      },
    });

    if (checkCitizen) {
      return { message_error: `บัตรประจำตัวประชาชนซ้ำ : ${checkCitizen.name}` };
    }

    // ---- เตรียมอัปโหลดไฟล์ (เก็บไฟล์ชื่อสุ่ม ป้องกัน traversal) -------------
    const safeFolder = path.join(
      this.uploadsPath,
      String(values.code).replace(/[^a-zA-Z0-9-_]/g, ''),
    );
    await fs.ensureDir(safeFolder);

    let firstFile: string | null = null;

    // ฟังก์ชันช่วยสร้างชื่อไฟล์สุ่ม .png
    const makePngName = (seq: number) =>
      `${generateRandomString(6)}-${seq}.png`;

    // ---- ใช้ Transaction เพื่อให้อะตอมมิก -----------------------------------
    return await this.dataSource.transaction(async (manager) => {
      const customerRepo = manager.withRepository(this.customerRepository);
      const imageRepo = manager.withRepository(this.customerImageRepository);
      const userGroupRepo = manager.withRepository(this.userGroupRepository);
      const branchRepo = manager.withRepository(this.branchRepository);

      // (1) จัดการ user ตามการเปลี่ยน customerType
      // กรณี: 1<-จาก 3 และมีเลข ปชช 13 หลัก => สร้าง/อัปเดต user ลูกค้า
      if (
        values.customerType === '1' &&
        existingCustomer.customerType === '3' &&
        (existingCustomer.citizenIdCard?.length === 13 ||
          values.citizenIdCard?.length === 13)
      ) {
        const checkUser = await this.userService.findOneByCustomerId(id);
        if (checkUser) {
          await this.userService.update(checkUser.id, {
            username: (values.citizenIdCard || '').replace(/-/g, ''),
            password: (values.tel || '').replace(/-/g, ''),
            tel: values.tel,
            name: values.name,
            lastname: values.lastname,
            active: '1',
          });
        } else {
          const customerUserGroup = await userGroupRepo.findOne({
            where: { type: 'ลูกค้า' },
          });
          const createUserDtoForCustomer: CreateUserDto = {
            username: trimString(values.citizenIdCard),
            password: values.tel,
            name: values.name,
            lastname: values.lastname,
            tel: values.tel,
            branchId: values.branchId as any,
            bookbank: '',
            bookname: '',
            bookno: '',
            refreshToken: '',
            userGroupId: customerUserGroup?.id,
            type: 'ลูกค้า',
            active: '1',
            deviceType: 'mobile',
            customerId: id,
          };

          if (process.env.SYSTEM_BY === 'THUNDER') {
            const branchDown = await branchRepo.findOne({
              where: { isBranchDown: '1' },
            });
            if (branchDown?.id)
              createUserDtoForCustomer.branchId = branchDown.id as any;
          }
          await this.userService.create(createUserDtoForCustomer);
        }
      }
      // กรณี: 3<-จาก 1 => ปิดการใช้งาน user
      else if (
        values.customerType === '3' &&
        existingCustomer.customerType === '1'
      ) {
        const user = await this.userService.findOneByCustomerId(id);
        if (user) {
          await this.userService.update(user.id, { active: '0' });
        }
      }

      // (2) บันทึกรูปภาพลูกค้า (ต่อ seq ล่าสุด) — ถ้ามีไฟล์อัปโหลดมา
      if (Array.isArray(files) && files.length > 0) {
        const lastImage = await imageRepo.findOne({
          where: { customerId: id },
          order: { seq: 'DESC' },
        });
        const lastSeq = lastImage ? Number(lastImage.seq) : 0;

        for (let i = 0; i < files.length; i++) {
          const seq = lastSeq + 1 + i;
          const file = files[i];

          // อ่าน buffer แบบปลอดภัย
          const buffer = await fs.readFile(file.filepath);

          // sharp: .png ใช้ compressionLevel (0-9) และ adaptiveFiltering
          const fileName = makePngName(seq);
          const filePath = path.join(safeFolder, fileName);

          await sharp(buffer)
            .rotate() // auto-orient ตาม EXIF ถ้ามี
            .png({ compressionLevel: 9, adaptiveFiltering: true })
            .toFile(filePath);

          if (i === 0) {
            firstFile = filePath;
          }

          const newImage = imageRepo.create({
            name: filePath,
            customerId: id,
            userId: values.updateByUserId,
            seq,
          });
          await imageRepo.save(newImage);
        }
      }

      // ถ้าไม่ได้ส่ง fileCustomer มา แต่มีไฟล์อัปโหลด ให้ตั้งไฟล์แรก
      if (values.fileCustomer == null && firstFile) {
        values.fileCustomer = firstFile;
      }

      // (3) อัปเดตข้อมูล customer
      await customerRepo.update(id, values);

      // (4) ถ้าลูกค้าเป็นประเภท 1 และมี ปชช 13 หลัก ให้ sync user ตามการเปลี่ยนค่า
      if (
        (existingCustomer.customerType === '1' ||
          values.customerType === '1') &&
        (existingCustomer.citizenIdCard?.length === 13 ||
          values.citizenIdCard?.length === 13)
      ) {
        const userToUpdate = await this.userService.findOneByCustomerId(
          existingCustomer.id,
        );
        if (userToUpdate) {
          const updateUserDto: Partial<UpdateUserDto> = {};
          let needsUpdate = false;

          if (
            values.citizenIdCard &&
            values.citizenIdCard !== existingCustomer.citizenIdCard
          ) {
            updateUserDto.username = values.citizenIdCard;
            needsUpdate = true;
          }
          if (values.tel && values.tel !== existingCustomer.tel) {
            updateUserDto.password = (values.tel || '').replace(/-/g, '');
            updateUserDto.tel = values.tel;
            needsUpdate = true;
          }
          if (values.name && values.name !== existingCustomer.name) {
            updateUserDto.name = values.name;
            needsUpdate = true;
          }
          if (
            values.lastname &&
            values.lastname !== existingCustomer.lastname
          ) {
            updateUserDto.lastname = values.lastname;
            needsUpdate = true;
          }

          if (needsUpdate) {
            try {
              await this.userService.update(
                userToUpdate.id,
                updateUserDto as UpdateUserDto,
              );
            } catch (error) {
              // ไม่ให้ล้มทั้งธุรกรรมเพราะ user อัปเดตไม่ได้
              // (เลือก log เงียบ ๆ)
              console.error(
                `Failed to update user for customer ${values.code}:`,
                error,
              );
            }
          }
        }
      }

      // (5) ส่งผลลัพธ์เหมือนเดิม
      return {
        message_success: `${MESSAGE_UPDATE_SUCCESS}: ${values.code}`,
        data: await this.findOne(id),
      };
    });
  }

  async delete(id: number, req: FastifyRequest): Promise<any> {
    // ค้นหาข้อมูล customer

    const productSale = await this.productSaleRepository.findOne({
      where: { customerId: id, isCancel: '1' },
    });

    if (!isEmpty(productSale)) {
      return {
        message_error: `ลูกค้าคนนี้มีในสัญญา ${productSale.code}`,
      };
    }

    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      return {
        message_error: 'ไม่พบข้อมูลลูกค้า',
      };
    }

    // ลบไฟล์ที่เกี่ยวข้อง
    if (customer.fileCustomer) {
      const fileExists = await fs.pathExists(customer.fileCustomer);
      if (fileExists) {
        await fs.remove(customer.fileCustomer);
      }
    }

    // ลบโฟลเดอร์และไฟล์รูปภาพ
    const customerCode = customer.code;
    const folderPath = path.join(this.uploadsPath, customerCode);

    const folderExists = await fs.pathExists(folderPath);
    if (folderExists) {
      // ลบ customer images จาก database
      await this.customerImageRepository.delete({ customerId: id });

      // ลบไฟล์ทั้งหมดในโฟลเดอร์
      const files = await fs.readdir(folderPath);
      if (files.length > 0) {
        await Promise.all(
          files.map((file) => fs.remove(path.join(folderPath, file))),
        );
      }
      // ลบโฟลเดอร์
      await fs.remove(folderPath);
    }

    // ลบข้อมูล customer จาก database
    await this.customerRepository.delete(id);

    return {
      message_success: MESSAGE_DELETE_SUCCESS,
    };
  }
}
