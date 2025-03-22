// 📁 src/models/teamMemberModel.js
import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String, // для завантаження через URL
    },
    photoFilePath: {
      type: String, // для локального шляху до завантаженого файлу
    },
  },
  { timestamps: true },
);

export default mongoose.model('TeamMember', teamMemberSchema);
