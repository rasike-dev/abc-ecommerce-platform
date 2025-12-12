import mongoose from 'mongoose';

const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
    },
    medium: {
      type: String,
    },
    teacher: {
      name: { type: String, required: true },
      title: { type: String, required: true },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model('Group', groupSchema);

export default Group;
