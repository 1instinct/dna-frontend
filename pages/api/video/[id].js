import axios from 'axios';

export default async function handler(req, res) {
  const { id } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY; // Store your API key in .env.local
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,contentDetails,statistics&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}