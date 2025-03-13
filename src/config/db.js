import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB підключено');
  } catch (err) {
    console.error('Помилка підключення до MongoDB:', err);
    process.exit(1); // Завершує програму у разі помилки підключення
  }
};

export default connectDB;
