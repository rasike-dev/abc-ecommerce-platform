import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async findAll(
    pageNumber = 1,
    keyword = '',
  ): Promise<{ groups: GroupDocument[]; page: number; pages: number }> {
    const pageSize = 20;
    const page = Number(pageNumber) || 1;

    const query: any = {};
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    const count = await this.groupModel.countDocuments(query);
    const groups = await this.groupModel
      .find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .exec();

    return {
      groups,
      page,
      pages: Math.ceil(count / pageSize),
    };
  }

  async findById(id: string): Promise<GroupDocument> {
    const group = await this.groupModel.findById(id).exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async create(createGroupDto: CreateGroupDto): Promise<GroupDocument> {
    const group = new this.groupModel(createGroupDto);
    return group.save();
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupDocument> {
    const group = await this.groupModel.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    Object.assign(group, updateGroupDto);
    return group.save();
  }

  async remove(id: string): Promise<{ message: string }> {
    const group = await this.groupModel.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    await group.deleteOne();
    return { message: 'Group removed' };
  }
}

