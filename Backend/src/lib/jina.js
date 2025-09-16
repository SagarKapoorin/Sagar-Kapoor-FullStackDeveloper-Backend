import axios from 'axios';

const JINA_EMBED_URL = 'https://api.jina.ai/v1/embeddings';

/**
 * Fetch embeddings from Jina Cloud.
 * @param {string[]} texts - array of texts to embed
 * @param {string} [modelOverride] - optional model name override
 * @param {boolean} normalize - whether to normalize embeddings
 * @returns {Promise<number[][]>} embeddings
 */
export async function getJinaEmbeddings(
  texts,
  modelOverride,
  normalize = true
) {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) {
    throw new Error('Missing JINA_API_KEY environment variable');
  }
  // Allow overriding model via env var or function arg
  const model = process.env.JINA_MODEL || modelOverride || 'jina/all-MiniLM-L6-v2';
  try {
    const response = await axios.post(
      JINA_EMBED_URL,
      { model, data: texts, parameters: { normalize_embeddings: normalize } },
      { headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
      }
    );
    return response.data.embeddings;
  } catch (err) {
    if (err.response && err.response.data) {
      console.error('Jina API error:', err.response.status, err.response.data);
    }
    throw err;
  }
}