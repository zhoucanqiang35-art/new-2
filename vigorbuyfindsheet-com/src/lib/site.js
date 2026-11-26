import counts from '../data/categories.json';
import featured from '../data/featured.json';
import qc from '../data/qc.json';

export const signup = 'https://vigorbuy.com/signUp?utm_source=website&utm_medium=ambassador&utm_campaign=linksharing&inviteCode=rPEjqK1O';
export const source = 'https://findspreadsheet.com';
export const buy = (id) => 'https://vigorbuy.com/product/2/' + id;
export const items = featured;
export const warehouse = qc;
export const count = Object.values(counts).reduce((sum, value) => sum + value, 0);
export const names = {
  shoes: 'Shoes', 'hoodies-sweaters': 'Hoodies & Sweaters', 't-shirts': 'T-Shirts',
  jackets: 'Jackets', 'pants-shorts': 'Pants & Shorts', headwear: 'Headwear',
  accessories: 'Accessories', jersey: 'Jerseys', ShortSets: 'Short Sets',
  electronics: 'Electronics', 'other-stuff': 'Other Finds',
};
export const categories = Object.entries(names)
  .filter(([id]) => counts[id])
  .map(([id, name]) => ({ id, slug: id.toLowerCase(), name, count: counts[id] }));
export { price } from './money';
