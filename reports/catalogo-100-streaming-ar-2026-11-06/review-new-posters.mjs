import fs from 'node:fs/promises';
import sharp from 'sharp';
const folder = 'reports/catalogo-100-streaming-ar-2026-11-06/.source-review';
await fs.mkdir(folder, { recursive: true });
for (const [name, url] of [
  ['mary-poppins-1964.jpg', 'https://www.impawards.com/1964/posters/mary_poppins_xlg.jpg'],
  ['mary-poppins-1964-ver2.jpg', 'https://www.impawards.com/1964/posters/mary_poppins_ver2_xlg.jpg'],
  ['mary-poppins-1964-ver3.jpg', 'https://www.impawards.com/1964/posters/mary_poppins_ver3_xlg.jpg'],
  ['mary-poppins-1964-ver4.jpg', 'https://www.impawards.com/1964/posters/mary_poppins_ver4_xlg.jpg'],
  ['mary-poppins-1964-original.jpg', 'https://www.posterpalace.com/cdn/shop/files/mary-poppins-posterpalacecom-712210.jpg?v=1762922013'],
  ['deliverance-1972.jpg', 'https://www.impawards.com/1972/posters/deliverance_xlg.jpg'],
  ['deliverance-1972-ver2.jpg', 'https://www.impawards.com/1972/posters/deliverance_ver2_xlg.jpg'],
  ['deliverance-1972-ver3.jpg', 'https://www.impawards.com/1972/posters/deliverance_ver3_xlg.jpg'],
  ['muppet-movie-1979.jpg', 'https://www.impawards.com/1979/posters/muppet_movie_ver1_xxlg.jpg'],
  ['muppet-movie-1979-filmmart.jpg', 'https://filmartgallery.com/cdn/shop/files/The-Muppet-Movie-Vintage-Movie-Poster-Original_4c2983bf.jpg?v=1741756231'],
]) {
  const response = await fetch(url);
  if (!response.ok) { console.log(JSON.stringify({ name, url, status: response.status })); continue; }
  const buffer = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(buffer).metadata();
  const file = `${folder}/${name}`;
  if ((metadata.width ?? 0) >= 720 && (metadata.height ?? 0) >= 1000) await fs.writeFile(file, buffer);
  console.log(JSON.stringify({ name, url, status: response.status, contentType: response.headers.get('content-type'), bytes: buffer.length, width: metadata.width, height: metadata.height, format: metadata.format, saved: (metadata.width ?? 0) >= 720 && (metadata.height ?? 0) >= 1000 }));
}
