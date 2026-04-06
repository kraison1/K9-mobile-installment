import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferProductBranchList } from './entities/transfer-product-branch-list.entity';

@Injectable()
export class TransferProductBranchListsService {
  constructor(
    @InjectRepository(TransferProductBranchList)
    private readonly transferProductBranchListsServiceRepository: Repository<TransferProductBranchList>,
  ) {}
}
