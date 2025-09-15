import axios from 'axios';

const JINA_EMBED_URL = 'https://api.jina.ai/v1/embeddings';
const JINA_API_KEY = process.env.JINA_API_KEY;

export async function getJinaEmbeddings(
  texts,
  model = 'jinaai/all-MiniLM-L6-v2',
  normalize = true
) {
  if (!JINA_API_KEY) {
    throw new Error('Missing JINA_API_KEY environment variable');
  }
  const response = await axios.post(
    JINA_EMBED_URL,
    {
      model,
      data: texts,
      parameters: { normalize_embeddings: normalize },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JINA_API_KEY}`,
      },
    }
  );
  return response.data.embeddings;
}