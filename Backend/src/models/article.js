import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  embedding: { type: [Number], required: true },
  url: { type: String },
  publishedAt: { type: Date }
});

// NOTE: Vector index on 'embedding' must be created manually via MongoDB shell.
// See README for 'Manual Vector Index Creation' instructions.

const Article = mongoose.model('Article', articleSchema);
export default Article;