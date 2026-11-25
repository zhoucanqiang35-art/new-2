export function photoThumbnail(url, width) {
  if (url.startsWith('https://si.geilicdn.com/') && !url.includes('?')) {
    return url + '?imageView2/2/w/' + width;
  }
  return url;
}
