import mongoose from 'mongoose';

const TestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true, minlength: 0 },
});

const TestModel = mongoose.model('Test', TestSchema);

export default TestModel;
