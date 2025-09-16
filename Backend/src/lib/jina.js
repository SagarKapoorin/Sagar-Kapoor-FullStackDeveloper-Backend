import axios from 'axios';

const JINA_EMBED_URL = 'https://api.jina.ai/v1/embeddings';
export async function getJinaEmbeddings(
  texts
) {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) {
    throw new Error('Missing JINA_API_KEY environment variable');
  }
  const model = process.env.JINA_MODEL || 'jina-embeddings-v3';
  try {
    const response = await axios.post(
      JINA_EMBED_URL,
       {
        model,
        input: texts,  
      },
      { headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
      }
    );
    return response.data.data.map(d => d.embedding);
  } catch (err) {
    if (err.response && err.response.data) {
      console.error('Jina API error:', err.response.status, err.response.data);
    }
    throw err;
  }
}