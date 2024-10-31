// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const functions = require('firebase-functions/v2');

const token = 'BQAmYRVKVe2VanZEj3SE7Dw1ECBy1RBpHis7vsYE9E7EOKEwRfDTNbBGD_42lgwi9TcR-WARzaudiTHmHUGRxP6XSkzYUgsXtqk6cPvVQ4RAqa8qEczRf-45tkcxmI4_WZiGGIXcKuWmxgDn_ntDWipO4auhHIJDf2TFuq4_VxJXYALyAR9otXpChZk0sFdQBrJUEz3Zl63oLUIjncnUB5yFXwHch2PoQTXAwcn7xE1JgvoFn5Fs7FSX2UhZZaSC4h8FZKi3h22Gbx-Uuy5Be6bXdPmhNTGtIJla';
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body:JSON.stringify(body)
  });
  return await res.json();
}

async function getTopTracks(){
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  return (await fetchWebApi(
    'v1/me/top/tracks?time_range=long_term&limit=5', 'GET'
  )).items;
}

const topTracks = await getTopTracks();
console.log(
  topTracks?.map(
    ({name, artists}) =>
      `${name} by ${artists.map(artist => artist.name).join(', ')}`
  )
);