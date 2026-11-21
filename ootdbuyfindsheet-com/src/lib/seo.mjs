export const productionOrigin = 'https://ootdbuyfindsheet.com';
export const isProductionSite = process.env.SITE_INDEXABLE === '1';
export const publicRoutes = ['/', '/categories/', '/spreadsheet/', '/how-to-order/', '/handoffs/', '/help/', '/guides/shipping/'];
export const categoryPath = key => '/categories/' + key.toLowerCase() + '/';
export const productPath = id => '/products/' + id + '/';
export const siteUrl = path => new URL(path,productionOrigin).href;
