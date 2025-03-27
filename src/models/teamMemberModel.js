import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
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
      type: String, // URL до фото
    },
    photoFilePath: {
      type: String, // для локального шляху (якщо використовувався)
    },
    cloudinaryPublicId: {
      type: String, // для Cloudinary
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model('TeamMember', teamMemberSchema);
