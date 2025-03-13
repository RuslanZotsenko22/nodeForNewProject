import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

const TestModel = mongoose.model('Test', testSchema);

export default TestModel;
