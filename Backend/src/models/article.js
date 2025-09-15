import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  embedding: { type: [Number], required: true },
  url: { type: String },
  publishedAt: { type: Date }
});

const embeddingDim = parseInt(process.env.EMBEDDING_DIM, 10) || 384;
articleSchema.index(
  { embedding: 'vector' },
  { name: 'embedding_vector_idx', dimensions: embeddingDim }
);

const Article = mongoose.model('Article', articleSchema);
export default Article;