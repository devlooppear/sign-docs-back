import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssinService } from './assin.service';
import { CreateAssinDto } from './dto/create-assin.dto';
import { UpdateAssinDto } from './dto/update-assin.dto';

@Controller('assin')
export class AssinController {
  constructor(private readonly assinService: AssinService) {}

  @Post()
  create(@Body() createAssinDto: CreateAssinDto) {
    return this.assinService.create(createAssinDto);
  }

  @Get()
  findAll() {
    return this.assinService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assinService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssinDto: UpdateAssinDto) {
    return this.assinService.update(+id, updateAssinDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assinService.remove(+id);
  }
}
