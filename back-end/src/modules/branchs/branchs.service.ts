import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Not, Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { BranchSearchDto } from 'src/helper/search.dto';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { isEmpty } from 'lodash';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class BranchService {
  private readonly uploadsPath = path.join('uploads/branches');

  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    const files = await req.saveRequestFiles();

    const {
      name,
      nameRefOne,
      nameRefTwo,
      code,
      valueFollowOneMonth,
      valueFollowMoreThanMonth,
      ownerBank,
      ownerBankName,
      ownerBankNo,
      ownerName,
      ownerIdCard,
      ownerAddress,
      online,
      active,
      token_bot,
      room_id_daylily_mobile,
      room_id_daylily_accessibility,
      room_id_sale_daylily_mobile,
      room_id_sale_daylily_accessibility,
      room_id_processBook,
      room_id_processCases,
      room_id_lockAppleId,
      room_id_unlockAppleId,
      room_id_paymentDown,
      room_id_buyProduct,
      priceBranchService,
      isBranchDown,
      facebook,
      lineOa,
      googlemaps,
    } = req.body as any;

    const checkCode = await this.branchRepository.findOne({
      where: { code: code?.value },
    });

    if (!isEmpty(checkCode)) {
      return { message_error: `Code ซ้ำ : ${checkCode.name}` };
    } else {
      let filePath = '';
      let fileBranch = '';
      if (files.length > 0) {
        await fs.ensureDir(`${this.uploadsPath}/${code?.value}`);
        const file = files[0];
        const buffer = await fs.readFile(file.filepath);
        const filename = `${code?.value}.png`;
        filePath = path.join(this.uploadsPath, code?.value, filename);
        fileBranch = filePath;

        await sharp(buffer)
          .png({ quality: 80, progressive: true })
          .toFile(filePath);
      }
      const createBranchDto = {
        name: name?.value || '',
        nameRefOne: nameRefOne?.value || '',
        nameRefTwo: nameRefTwo?.value || '',
        code: code?.value || '',
        ownerBank: ownerBank?.value || '',
        ownerBankName: ownerBankName?.value || '',
        ownerBankNo: ownerBankNo?.value || '',
        valueFollowOneMonth: valueFollowOneMonth?.value || 50,
        valueFollowMoreThanMonth: valueFollowMoreThanMonth?.value || 50,
        online: online?.value || '',
        active: active?.value || '',
        fileBranch,
        ownerName: ownerName?.value || '',
        ownerIdCard: ownerIdCard?.value || '',
        ownerAddress: ownerAddress?.value || '',
        token_bot: token_bot?.value || '',
        room_id_daylily_mobile: room_id_daylily_mobile?.value || '',
        room_id_daylily_accessibility:
          room_id_daylily_accessibility?.value || '',
        room_id_sale_daylily_mobile: room_id_sale_daylily_mobile?.value || '',
        room_id_sale_daylily_accessibility:
          room_id_sale_daylily_accessibility?.value || '',
        room_id_processBook: room_id_processBook?.value || '',
        room_id_processCases: room_id_processCases?.value || '',
        room_id_lockAppleId: room_id_lockAppleId?.value || '',
        room_id_unlockAppleId: room_id_unlockAppleId?.value || '',
        room_id_paymentDown: room_id_paymentDown?.value || '',
        room_id_buyProduct: room_id_buyProduct?.value || '',
        priceBranchService: priceBranchService?.value || 0,
        isBranchDown: isBranchDown?.value || '0',
        facebook: facebook?.value || '',
        lineOa: lineOa?.value || '',
        googlemaps: googlemaps?.value || '',
      };

      const newBranch = this.branchRepository.create(createBranchDto);
      const createBranch = await this.branchRepository.save(newBranch);

      if (createBranch.isBranchDown === '1') {
        await this.branchRepository.update(
          { id: Not(createBranch.id) },
          { isBranchDown: '0' },
        );
      }

      return {
        message_success: `${MESSAGE_SAVE_SUCCESS}: ${newBranch.name}`,
      };
    }
  }

  async findAll(searchBranchDto: BranchSearchDto): Promise<{
    data: Branch[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder = this.branchRepository.createQueryBuilder('branch');

    queryBuilder.select([
      'branch.*',
      `CASE WHEN branch.online = '1' THEN 'ขายออนไลน์ได้' ELSE 'ไม่ได้' END as online_str`,
    ]);

    if (searchBranchDto.branchId !== 0) {
      queryBuilder.andWhere('branch.id = :branchId', {
        branchId: searchBranchDto.branchId,
      });
    }

    if (searchBranchDto.search) {
      queryBuilder.andWhere(
        '(branch.code ILIKE :search OR branch.name ILIKE :search)',
        { search: `%${searchBranchDto.search}%` },
      );
    }

    if (searchBranchDto.active !== '2') {
      queryBuilder.andWhere('branch.active = :active', {
        active: searchBranchDto.active,
      });
    }

    if (searchBranchDto.online !== '2') {
      queryBuilder.andWhere('branch.online = :online', {
        online: searchBranchDto.online,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('branch.name', 'ASC')
      .skip((searchBranchDto.page - 1) * searchBranchDto.pageSize)
      .take(searchBranchDto.pageSize);

    const branches = await queryBuilder.getRawMany();

    return {
      data: branches,
      total,
      page: searchBranchDto.page,
      pageSize: searchBranchDto.pageSize,
    };
  }

  async getSelect(): Promise<Pick<Branch, 'id' | 'name' | 'isBranchDown'>[]> {
    return this.branchRepository.find({
      where: { active: '1' },
      select: ['id', 'name', 'isBranchDown'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<any> {
    const branch = await this.branchRepository.findOne({ where: { id } });
    return branch;
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();
    // console.log('files', files);
    // return '';

    const {
      name,
      nameRefOne,
      nameRefTwo,
      code,
      valueFollowOneMonth,
      valueFollowMoreThanMonth,
      ownerBank,
      ownerBankName,
      ownerBankNo,
      ownerName,
      ownerIdCard,
      ownerAddress,
      online,
      active,
      token_bot,
      room_id_daylily_mobile,
      room_id_daylily_accessibility,
      room_id_sale_daylily_mobile,
      room_id_sale_daylily_accessibility,
      room_id_processBook,
      room_id_processCases,
      room_id_lockAppleId,
      room_id_unlockAppleId,
      room_id_paymentDown,
      room_id_buyProduct,
      priceBranchService,
      isBranchDown,
      facebook,
      lineOa,
      googlemaps,
    } = req.body as any;

    const existingBranch = await this.branchRepository.findOne({
      where: { id },
    });

    if (code != existingBranch.code) {
      const checkCode = await this.branchRepository.findOne({
        where: {
          code: code.value,
          id: Not(Equal(id)),
        },
      });

      if (!isEmpty(checkCode)) {
        return { message_error: `Code ซ้ำ : ${checkCode.name}` };
      }
    }

    let filePath = existingBranch.fileBranch;
    let fileBranch = existingBranch.fileBranch;
    let fileSignatureOwner = existingBranch.fileSignatureOwner;
    let fileSignatureRefOne = existingBranch.fileSignatureRefOne;
    let fileSignatureRefTwo = existingBranch.fileSignatureRefTwo;

    if (files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${existingBranch.code}`);
      await Promise.all(
        files.map(async (file) => {
          const prefix =
            file.fieldname === 'fileSignatureOwner'
              ? 'owner'
              : file.fieldname === 'fileSignatureRefOne'
                ? 'refOne'
                : file.fieldname === 'fileSignatureRefTwo'
                  ? 'refTwo'
                  : '';
          const filename = `${prefix ? `${prefix}-` : ''}${existingBranch.code}.png`;
          filePath = path.join(this.uploadsPath, existingBranch.code, filename);

          // Assign to the appropriate variable
          if (file.fieldname === 'fileSignatureOwner')
            fileSignatureOwner = filePath;
          else if (file.fieldname === 'fileSignatureRefOne')
            fileSignatureRefOne = filePath;
          else if (file.fieldname === 'fileSignatureRefTwo')
            fileSignatureRefTwo = filePath;
          else fileBranch = filePath;

          const buffer = await fs.readFile(file.filepath);
          await sharp(buffer)
            .png({ quality: 80, progressive: true })
            .toFile(filePath);
        }),
      );
    }

    const updateData = {
      name: name?.value || existingBranch.name,
      nameRefOne: nameRefOne?.value || existingBranch.nameRefOne,
      nameRefTwo: nameRefTwo?.value || existingBranch.nameRefTwo,
      code: code?.value || existingBranch.code,
      ownerBank: ownerBank?.value || existingBranch.ownerBank,
      ownerBankName: ownerBankName?.value || existingBranch.ownerBankName,
      ownerBankNo: ownerBankNo?.value || existingBranch.ownerBankNo,
      valueFollowOneMonth:
        valueFollowOneMonth?.value || existingBranch.valueFollowOneMonth,
      valueFollowMoreThanMonth:
        valueFollowMoreThanMonth?.value ??
        existingBranch.valueFollowMoreThanMonth,
      ownerName: ownerName?.value || existingBranch.ownerName,
      ownerIdCard: ownerIdCard?.value || existingBranch.ownerIdCard,
      ownerAddress: ownerAddress?.value || existingBranch.ownerAddress,
      online: online?.value || existingBranch.online,
      active: active?.value || existingBranch.active,
      fileBranch,
      fileSignatureOwner,
      fileSignatureRefOne,
      fileSignatureRefTwo,
      token_bot: token_bot?.value || '',
      room_id_daylily_mobile: room_id_daylily_mobile?.value || '',
      room_id_daylily_accessibility: room_id_daylily_accessibility?.value || '',
      room_id_sale_daylily_mobile: room_id_sale_daylily_mobile?.value || '',
      room_id_sale_daylily_accessibility:
        room_id_sale_daylily_accessibility?.value || '',
      room_id_processBook: room_id_processBook?.value || '',
      room_id_processCases: room_id_processCases?.value || '',
      room_id_lockAppleId: room_id_lockAppleId?.value || '',
      room_id_unlockAppleId: room_id_unlockAppleId?.value || '',
      room_id_paymentDown: room_id_paymentDown?.value || '',
      room_id_buyProduct: room_id_buyProduct?.value || '',
      priceBranchService: priceBranchService?.value || 0,
      isBranchDown: isBranchDown?.value || '0',
      facebook: facebook?.value || '',
      lineOa: lineOa?.value || '',
      googlemaps: googlemaps?.value || '',
    };

    await this.branchRepository.update(id, updateData);

    if (updateData.isBranchDown === '1') {
      await this.branchRepository.update(
        { id: Not(id) },
        { isBranchDown: '0' },
      );
    }

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${updateData.name}`,
    };
  }

  // async downloadFile(id: number, res: FastifyReply): Promise<void> {
  //   try {
  //     const existingBranch = await this.branchRepository.findOne({
  //       where: { id },
  //     });

  //     const filePath = path.join(this.uploadsPath);
  //     res.header('Content-Type', 'application/octet-stream');
  //     res.header(
  //       'Content-Disposition',
  //       `attachment; filename=${existingBranch.fileBranch}`,
  //     );
  //     const fileStream = fs.createReadStream(
  //       `${filePath}/${existingBranch.fileBranch}`,
  //     );
  //     res.send(fileStream);
  //   } catch (error) {
  //     res.status(500).send({ error: error.message });
  //   }
  // }
}
