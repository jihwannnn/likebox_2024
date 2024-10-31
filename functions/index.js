const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Firebase 초기화
admin.initializeApp();

// 환경 변수에서 CLIENT_ID와 CLIENT_SECRET 가져오기
const config = functions.config();

const CLIENT_ID = config.spotify.client_id;
const CLIENT_SECRET = config.spotify.client_secret;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Spotify CLIENT_ID and CLIENT_SECRET are not set in the environment variables.');
}


// Spotify 토큰을 가져오는 함수
async function getSpotifyToken() {
  const url = "https://accounts.spotify.com/api/token";
  const data = new URLSearchParams({ grant_type: 'client_credentials' });
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  try {
    const response = await axios.post(url, data.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      }
    });

    if (response.status === 200) {
      return response.data.access_token;
    } else {
      throw new Error(`Failed to get token: ${response.data}`);
    }
  } catch (error) {
    throw new Error(`Failed to get token: ${error.response.data}`);
  }
}

// Cloud Function 정의
exports.getSpotifyTrack = functions.https.onRequest(async (req, res) => {
  const track_id = req.query.track_id || '1ygmHMAn6HYtCrQ4fHqD0x';

  try {
    const token = await getSpotifyToken();
    const headers = { "Authorization": `Bearer ${token}` };
    const url = `https://api.spotify.com/v1/tracks/${track_id}`;

    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const track = response.data;

      // 트랙 정보 추출
      const track_info = {
        "Track Name": track.name,
        "Artist": track.artists[0].name,
        "Album": track.album.name,
        "Release Date": track.album.release_date,
        "Spotify URL": track.external_urls.spotify,
        "Album Cover": track.album.images[0].url,
        "Popularity": track.popularity,
        "Duration (ms)": track.duration_ms
      };

      // JSON 응답 반환
      res.status(200).json(track_info);
    } else {
      res.status(500).send(`Spotify API Error: ${response.data}`);
    }
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});
