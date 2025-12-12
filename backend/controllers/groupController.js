import asyncHandler from 'express-async-handler';
import Group from '../models/groupModel.js';

// @desc    Fetch all groups
// @route   GET /api/groups
// @access  Public
const getGroups = asyncHandler(async (req, res) => {
  const pageSize = 20;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Group.countDocuments({ ...keyword });
  const groups = await Group.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ groups, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single group
// @route   GET /api/groups/:id
// @access  Public
const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (group) {
    res.json(group);
  } else {
    res.status(404);
    throw new Error('Group not found');
  }
});

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private/Admin
const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (group) {
    await group.remove();
    res.json({ message: 'Group removed' });
  } else {
    res.status(404);
    throw new Error('Group not found');
  }
});

// @desc    Create a group
// @route   POST /api/groups
// @access  Private/Admin
const createGroup = asyncHandler(async (req, res) => {
  const group = new Group({
    name: 'Sample name',
    image: '/images/sample.jpg',
    medium: 'Sample medium',
    code: 'Sample category',
    subject: 'sample subject',
    teacher: {
      name: 'teachers name',
      title: 'Mr. Mrs. Ms. Ven.',
    },
    description: 'Sample description',
  });

  const createdGroup = await group.save();
  res.status(201).json(createdGroup);
});

// @desc    Update a group
// @route   PUT /api/groups/:id
// @access  Private/Admin
const updateGroup = asyncHandler(async (req, res) => {
  const { name, description, image, medium, code, subject, teacher } = req.body;

  const group = await Group.findById(req.params.id);

  if (group) {
    group.name = name;
    group.description = description;
    group.image = image;
    group.medium = medium;
    group.code = code;
    group.subject = subject;
    group.teacher = teacher;

    const updatedGroup = await group.save();
    res.json(updatedGroup);
  } else {
    res.status(404);
    throw new Error('Group not found');
  }
});

export { getGroups, getGroupById, deleteGroup, createGroup, updateGroup };
