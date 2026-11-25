export function listingPhotoShard(id) {
  return /^\d+$/.test(String(id)) ? '/data/listing-photos/' + Math.floor(Number(id) / 100) + '.json' : '';
}

export function listingPhotoUrl(photo) {
  return photo.startsWith('/uploads/') ? 'https://findspreadsheet.com' + photo : photo;
}
