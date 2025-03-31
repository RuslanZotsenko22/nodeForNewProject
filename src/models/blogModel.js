import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
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
    date: {
      type: String,
      required: true, // формат: YYYY-MM-DD
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String, // Cloudinary image link
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
    },
    youtubeLink: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model('BlogPost', blogSchema);
