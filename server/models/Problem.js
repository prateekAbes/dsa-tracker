import mongoose from 'mongoose';

const solutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true, default: 'javascript' },
}, { timestamps: true });

const problemSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  number: { type: Number, required: true, index: true },
  title: { type: String, required: true },
  topic: { type: String, required: true, index: true },
  topicIndex: { type: Number, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  isOriginal: { type: Boolean, default: false },
  isStriver: { type: Boolean, default: true },
  status: { type: String, enum: ['todo', 'in-progress', 'done', 'revision'], default: 'todo', index: true },
  notes: { type: String, default: '' },
  solutionUrl: { type: String, default: '' },
  leetcodeUrl: { type: String, default: '' },
  solutions: { type: [solutionSchema], default: [] },
  tags: { type: [String], default: [] },
  completedAt: { type: Date, default: null }
}, {
  timestamps: true
});

export default mongoose.model('Problem', problemSchema);
