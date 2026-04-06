import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { CreateTransferProductBranchDto } from './dto/create-transfer-product-branch.dto';
import { TransferProductBranch } from './entities/transfer-product-branch.entity';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import dayjs from 'src/configs/dayjs-config';
import { TransferProductBranchSearchDto } from 'src/helper/search.dto';
import { TransferProductBranchList } from '../transfer-product-branch-lists/entities/transfer-product-branch-list.entity';
import { Product } from '../product/entities/product.entity';

import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { toIntegerOrNull } from 'src/helper/transformValue';
import { isNumber } from 'lodash';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { generateRandomString } from 'src/helper/generateRandomString';
import { ProductPrice } from '../product-price/entities/product-price.entity';
import { ProductImage } from '../product-image/entities/product-image.entity';

@Injectable()
export class TransferProductBranchService {
  private readonly uploadsPath = path.join('uploads/transfer-product');

  constructor(
    @InjectRepository(TransferProductBranch)
    private readonly transferProductBranchRepository: Repository<TransferProductBranch>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    @InjectRepository(TransferProductBranchList)
    private readonly transferProductBranchListRepository: Repository<TransferProductBranchList>,

    private readonly productLogService: ProductLogService,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductPrice)
    private readonly productPriceRepository: Repository<ProductPrice>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  async create(
    createTransferProductBranchDto: CreateTransferProductBranchDto,
  ): Promise<any> {
    const branch = await this.branchRepository.findOne({
      where: { id: createTransferProductBranchDto.branchId },
    });

    if (!branch) {
      throw new Error('Branch not found');
    }

    const toBranch = await this.branchRepository.findOne({
      where: { id: createTransferProductBranchDto.toBranchId },
    });

    if (!toBranch) {
      throw new Error('To Branch not found');
    }

    const dateCode = dayjs().format('YYYYMMDD');
    const prefix = `Tr${dateCode}`;

    const latestTransferProductBranch =
      await this.transferProductBranchRepository
        .createQueryBuilder('transferProductBranch')
        .where('transferProductBranch.branchId = :branchId', {
          branchId: branch.id,
        })
        .andWhere('transferProductBranch.toBranchId = :toBranchId', {
          toBranchId: toBranch.id,
        })
        .andWhere('transferProductBranch.code ILIKE :code', {
          code: `${prefix}%`,
        })
        .orderBy('transferProductBranch.code', 'DESC')
        .getOne();

    const runNumber = latestTransferProductBranch
      ? (parseInt(latestTransferProductBranch.code.slice(-4), 10) + 1)
          .toString()
          .padStart(4, '0')
      : '0001';

    const transferProductBranchCode = `${prefix}${runNumber}`;

    const newTransferProductBranch =
      this.transferProductBranchRepository.create({
        ...createTransferProductBranchDto,
        code: transferProductBranchCode,
      });

    const savedTransferProductBranch =
      await this.transferProductBranchRepository.save(newTransferProductBranch);

    for (const item of createTransferProductBranchDto.transferProductBranchLists) {
      const transferProductBranchList =
        this.transferProductBranchListRepository.create({
          productId: item.productId,
          amount: item.amount,
          transferProductBranchId: savedTransferProductBranch.id,
          priceCostBuy: item.priceCostBuy,
          priceSale: item.priceSale,
        });

      await this.transferProductBranchListRepository.save(
        transferProductBranchList,
      );
    }

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(searchDto: TransferProductBranchSearchDto): Promise<{
    data: TransferProductBranch[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.transferProductBranchRepository.createQueryBuilder(
        'transfer_product_branch',
      );

    queryBuilder
      .select(['transfer_product_branch', 'create_by.id', 'create_by.name'])
      .leftJoinAndSelect('transfer_product_branch.branch', 'branch')
      .leftJoinAndSelect('transfer_product_branch.toBranch', 'toBranch')
      .leftJoinAndSelect('transfer_product_branch.transport', 'transport')
      .leftJoin('transfer_product_branch.create_by', 'create_by')
      .where('transfer_product_branch.catalog = :catalog', {
        catalog: searchDto.catalog,
      });

    if (searchDto.search) {
      queryBuilder.andWhere(
        '(transfer_product_branch.code ILIKE :search OR transfer_product_branch.tackingNumber ILIKE :search)',
        { search: `%${searchDto.search}%` },
      );
    }

    // ตรวจสอบ branchId และ toBranchId
    if (searchDto.branchId || searchDto.toBranchId) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          if (searchDto.branchId) {
            qb.where('transfer_product_branch.branchId = :branchId', {
              branchId: searchDto.branchId,
            });
          }
          if (searchDto.toBranchId) {
            qb.orWhere('transfer_product_branch.toBranchId = :toBranchId', {
              toBranchId: searchDto.toBranchId,
            });
          }
        }),
      );
    }

    queryBuilder.andWhere('transfer_product_branch.status = :status', {
      status: searchDto.status,
    });

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('transfer_product_branch.create_date', 'DESC')
      .skip((searchDto.page - 1) * searchDto.pageSize)
      .take(searchDto.pageSize);

    const transferProductBranches = await queryBuilder.getMany();

    return {
      data: transferProductBranches,
      total,
      page: searchDto.page,
      pageSize: searchDto.pageSize,
    };
  }

  async findOne(id: number): Promise<TransferProductBranch | null> {
    return this.transferProductBranchRepository.findOne({
      where: { id },
      relations: ['transferProductBranchLists'],
    });
  }

  async findByTransferProductBranchId(id: number): Promise<any> {
    // ดึงข้อมูล TransferProductBranchList ที่มี transferProductBranchId เท่ากับ id ที่กำหนด
    const lists = await this.transferProductBranchListRepository.find({
      where: {
        transferProductBranchId: id,
      },
    });

    // สร้าง array ของ productId จาก lists
    const productIds = lists.map((list) => list.productId);

    // ดึงข้อมูลของ products โดยใช้ productIds
    const products = await this.productRepository.find({
      where: {
        id: In(productIds),
      },
      select: ['id', 'code', 'imei', 'priceCostBuy', 'priceSale'],
    });

    return products;
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);

    const files = await req.saveRequestFiles();

    const {
      code,
      transportId,
      refOldStockNumber,
      transport,
      tackingNumber,
      toBranchId,
      create_date,
      updateByUserId,
      fileTransferProductBranch,
      branchId,
      status,
      createByUserId,
      catalog,
    } = req.body as any;

    // Parse transferProductBranchLists
    const transferProductBranchLists = Object.keys(req.body).reduce(
      (acc, key) => {
        const match = key.match(
          /^transferProductBranchLists\[(\d+)\]\[(\w+)\]$/,
        );
        if (match) {
          const [, index, field] = match;
          acc[index] = acc[index] || {};
          acc[index][field] = req.body[key].value;
        }
        return acc;
      },
      [],
    );

    // Prepare values
    const values = {
      refOldStockNumber: refOldStockNumber?.value ?? null,
      code: code?.value ?? null,
      catalog: catalog?.value ?? null,
      transportId: toIntegerOrNull(transportId?.value),
      transport: transport?.value ?? null,
      tackingNumber: tackingNumber?.value ?? null,
      toBranchId: toBranchId?.value ?? null,
      create_date: create_date?.value ?? null,
      updateByUserId: updateByUserId?.value ?? null,
      branchId: branchId?.value ?? null,
      createByUserId: createByUserId?.value ?? null,
      fileTransferProductBranch: fileTransferProductBranch?.value ?? null,
      status: status?.value ?? null,
    };

    const old = await this.transferProductBranchRepository.findOne({
      where: { id },
      relations: ['transferProductBranchLists'],
    });

    await this.transferProductBranchRepository.update(id, values);

    for (let index = 0; index < transferProductBranchLists.length; index++) {
      let item = transferProductBranchLists[index];
      if (item.id) {
        // ถ้า id มีอยู่แล้ว อัปเดตข้อมูล
        const existingList = old.transferProductBranchLists.find(
          (list) => list.id === item.id,
        );
        if (existingList) {
          await this.transferProductBranchListRepository.update(item.id, item);
        }
      } else {
        // ถ้า id ไม่มี สร้างใหม่
        const newTransferProductBranchList =
          this.transferProductBranchListRepository.create({
            ...item,
            transferProductBranchId: id,
          });
        await this.transferProductBranchListRepository.save(
          newTransferProductBranchList,
        );
      }

      // อัปเดตสถานะของ Product ตามสถานะของ TransferProductBranch
      if (old.status !== values.status) {
        if (values.status === '1') {
          let productIdTo: number = null;
          let product = {
            refOldStockNumber:
              values.refOldStockNumber != undefined
                ? (Number(values.refOldStockNumber) + index + 1).toString()
                : '',
            amount: item.amount,
            priceCostBuy: item.priceCostBuy,
            branchId:
              values.catalog == 'มือถือ' ? values.toBranchId : values.branchId,
            updateBy: values.updateByUserId,
            create_date: new Date(),
          };

          if (values.catalog != 'มือถือ') {
            // สาขาต้นทาง
            const productInit = await this.productRepository.findOne({
              where: { id: item.productId },
              relations: ['productImages'],
            });

            if (productInit) {
              product.amount = productInit.amount - item.amount;

              // สาขาปลายทาง
              let productTo = await this.productRepository.findOneBy({
                productTypeId: productInit.productTypeId,
                productModelId: productInit.productModelId,
                productBrandId: productInit.productBrandId,
                branchId: values.toBranchId,
              });

              const productPrice = await this.productPriceRepository.findOne({
                where: {
                  productId: productInit.id,
                  priceCostBuy: item.priceCostBuy,
                  branchId: productInit.branchId,
                },
              });

              if (productPrice) {
                productPrice.amount =
                  Number(productPrice.amount) - Number(item.amount);
                await this.productPriceRepository.save(productPrice);
              }

              if (productTo) {
                productIdTo = productTo.id;
                productTo.priceCostBuy = item.priceCostBuy;
                productTo.amount =
                  Number(productTo.amount) + Number(item.amount);
                await this.productRepository.save(productTo);
              } else {
                const {
                  productImages,
                  amountClaim,
                  amountFree,
                  amountSale,
                  amountWithdraw,
                  amountRemaining,
                  id,
                  ...res
                } = productInit;

                const newProductTo = this.productRepository.create({
                  ...res,
                  amount: item.amount,
                  priceCostBuy: item.priceCostBuy,
                  create_by: user.id,
                  branchId: values.toBranchId,
                  create_date: new Date(),
                });

                productTo = await this.productRepository.save(newProductTo);
                productIdTo = productTo.id;

                // return {
                //   productTo: productTo,
                // };

                // Copy product images
                if (productImages && productImages.length > 0) {
                  const newImages = productImages.map((img) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...restOfImage } = img;
                    return this.productImageRepository.create({
                      ...restOfImage,
                      create_date: new Date(),
                      productId: productTo.id,
                    });
                  });
                  await this.productImageRepository.save(newImages);
                }
              }

              const productPriceTo = await this.productPriceRepository.findOne({
                where: {
                  productId: productTo.id,
                  priceCostBuy: item.priceCostBuy,
                  branchId: productTo.branchId,
                },
              });

              if (productPriceTo) {
                productPriceTo.amount =
                  Number(productPriceTo.amount) + Number(item.amount);
                await this.productPriceRepository.save(productPriceTo);
              } else {
                const newProductPrice = this.productPriceRepository.create({
                  productId: productTo.id,
                  branchId: productTo.branchId,
                  priceCostBuy: item.priceCostBuy,
                  amount: item.amount,
                });
                await this.productPriceRepository.save(newProductPrice);
              }
            }
          }

          await this.productRepository.update(item.productId, product);

          const existingProduct = await this.productRepository.findOne({
            where: { id: item.productId },
          });

          if (catalog == 'มือถือ') {
            const newUpdateProductDto = {
              ...existingProduct,
              updateByUserId: values.updateByUserId,
              note: `เลขติดตามสินค้า: ${values.tackingNumber}`,
            };

            const newProductLogDto: CreateProductLogDto = {
              productId: item.productId,
              action: 'รับสินค้าจากสาขา',
              obj: JSON.stringify({
                before: existingProduct,
                after: newUpdateProductDto,
              }),
              branchId: item.toBranchId,
              userId: values.updateByUserId,
            };

            await this.productLogService.create(newProductLogDto);
          } else {
            const existingProductTo = await this.productRepository.findOne({
              where: { id: productIdTo },
            });

            const newUpdateProductDto = {
              ...existingProductTo,
              updateByUserId: values.updateByUserId,
              note: `เลขติดตามสินค้า: ${values.tackingNumber}`,
            };

            const newProductLogDto: CreateProductLogDto = {
              productId: item.productId,
              action: 'รับสินค้าจากสาขา',
              obj: JSON.stringify({
                before: existingProductTo,
                after: newUpdateProductDto,
              }),
              branchId: values.toBranchId,
              userId: values.updateByUserId,
            };

            await this.productLogService.create(newProductLogDto);
          }

          const oldBranchUpdateProductDto = { ...existingProduct };
          oldBranchUpdateProductDto.branchId = values.branchId;
          const oldProductLogDto: CreateProductLogDto = {
            productId: item.productId,
            action: 'โอนสินค้าไปยังสาขา',
            obj: JSON.stringify({
              before: existingProduct,
              after: oldBranchUpdateProductDto,
            }),
            branchId: oldBranchUpdateProductDto.branchId,
            userId: values.createByUserId,
          };

          await this.productLogService.create(oldProductLogDto);
        } else if (old.status === '1' && values.status === '3') {
          await this.productRepository.update(item.productId, {
            branchId: values.branchId,
          });

          const existingProduct = await this.productRepository.findOne({
            where: { id: item.productId },
          });

          const newBranchUpdateProductDto = { ...existingProduct };
          newBranchUpdateProductDto.branchId = values.toBranchId;
          const newProductLogDto: CreateProductLogDto = {
            productId: item.productId,
            action: 'คืนสินค้าให้สาขา',
            obj: JSON.stringify({
              before: existingProduct,
              after: newBranchUpdateProductDto,
            }),
            branchId: newBranchUpdateProductDto.branchId,
            userId: values.createByUserId,
          };

          await this.productLogService.create(newProductLogDto);

          const oldBranchUpdateProductDto = { ...existingProduct };
          oldBranchUpdateProductDto.branchId = values.branchId;
          oldBranchUpdateProductDto.updateByUserId = values.updateByUserId;
          const oldProductLogDto: CreateProductLogDto = {
            productId: item.productId,
            action: 'ได้รับสินค้าคืนจากสาขา',
            obj: JSON.stringify({
              before: existingProduct,
              after: oldBranchUpdateProductDto,
            }),
            branchId: oldBranchUpdateProductDto.branchId,
            userId: values.updateByUserId,
          };

          await this.productLogService.create(oldProductLogDto);
        }
      }
    }

    // ลบรายการที่ไม่มีใน `updateTransferProductBranchDto`
    const incomingIds = transferProductBranchLists
      .map((item) => Number(item.id))
      .filter((id) => id !== undefined);

    const toRemove = old.transferProductBranchLists.filter(
      (list) => !incomingIds.includes(Number(list.id)),
    );

    for (const list of toRemove) {
      // อัปเดตสถานะของ Product ก่อนลบรายการ
      await this.productRepository.update(list.productId, {
        active: '1',
        branchId: values.branchId,
      });

      // ลบรายการออกจาก TransferProductBranchLists
      await this.transferProductBranchListRepository.remove(list);
    }

    if (files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${values.code}`);
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const buffer = await fs.readFile(file.filepath);
        const randomName = generateRandomString(6);
        const filename = `${randomName}.png`;
        const filePath = path.join(
          `${this.uploadsPath}/${values.code}`,
          filename,
        );
        await sharp(buffer)
          .png({ quality: 80, progressive: true })
          .toFile(filePath);

        await this.transferProductBranchRepository.update(id, {
          ...values,
          fileTransferProductBranch: filePath,
        });
      }
    }

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
