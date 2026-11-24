const catalogExamples = ['Sneakers', 'Hoodie', 'Wireless earbuds', '7866625981'];
const categoryExamples = {
  shoes: ['Sneakers', 'Running shoes', 'Casual slides'],
  'hoodies-sweaters': ['Hoodie', 'Full-zip', 'Pullover'],
  't-shirts': ['Graphic T-shirt', 'Crewneck', 'Button-up'],
  jackets: ['Denim jacket', 'Windbreaker', 'Puffer jacket'],
  accessories: ['Crew socks', 'Backpack', 'Wallet'],
  electronics: ['Wireless earbuds', 'Gaming mouse', 'Portable speaker'],
  'pants-shorts': ['Cargo pants', 'Jogger', 'Boxer briefs'],
  sets: ['Shorts set', 'Sportswear set', 'Floral shirt'],
  headwear: ['Baseball cap', 'Beanie', 'Bucket hat'],
  jersey: ['Football jersey', 'Training top', 'Football shorts'],
  'other-stuff': ['Fragrance', 'Swimwear', 'Bikini'],
};

export function searchExamples(category = '') {
  return categoryExamples[category] ?? catalogExamples;
}
