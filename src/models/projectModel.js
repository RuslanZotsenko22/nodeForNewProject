import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    cloudinaryPublicId: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model('Project', projectSchema);
