import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Admin } from '../common/decorators/admin.decorator';

@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all groups with pagination' })
  @ApiQuery({ name: 'pageNumber', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  async findAll(
    @Query('pageNumber') pageNumber?: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.groupsService.findAll(pageNumber, keyword);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID' })
  async findOne(@Param('id') id: string) {
    return this.groupsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a group (Admin only)' })
  async create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a group (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Admin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a group (Admin only)' })
  async remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
}

