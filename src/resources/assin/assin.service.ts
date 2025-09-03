import { Injectable } from '@nestjs/common';
import { CreateAssinDto } from './dto/create-assin.dto';
import { UpdateAssinDto } from './dto/update-assin.dto';

@Injectable()
export class AssinService {
  create(createAssinDto: CreateAssinDto) {
    return 'This action adds a new assin';
  }

  findAll() {
    return `This action returns all assin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assin`;
  }

  update(id: number, updateAssinDto: UpdateAssinDto) {
    return `This action updates a #${id} assin`;
  }

  remove(id: number) {
    return `This action removes a #${id} assin`;
  }
}
