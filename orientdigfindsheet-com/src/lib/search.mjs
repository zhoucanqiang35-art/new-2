const aliases = [
  { words: ['连帽卫衣', '连帽衫', '帽衫'], terms: ['hoodie', 'hooded sweatshirt'] },
  { words: ['圆领卫衣', '圆领衫'], terms: ['crewneck', 'crew neck', 'sweatshirt'] },
  { words: ['卫衣', '毛衣', '针织衫'], category: 'hoodies-sweaters' },
  { words: ['t恤', '短袖', '体恤'], category: 't-shirts' },
  { words: ['羽绒服'], terms: ['down jacket', 'puffer'] },
  { words: ['夹克', '外套', '风衣'], category: 'jackets' },
  { words: ['运动鞋', '跑鞋', '球鞋'], terms: ['sneaker', 'running shoe', 'trainer'] },
  { words: ['拖鞋', '凉鞋'], terms: ['slide', 'sandal', 'slipper'] },
  { words: ['鞋子', '鞋类', '鞋'], category: 'shoes' },
  { words: ['牛仔裤'], terms: ['jean', 'denim pant'] },
  { words: ['短裤', '长裤', '裤子'], category: 'pants-shorts' },
  { words: ['棒球帽', '鸭舌帽'], terms: ['baseball cap', 'cap'] },
  { words: ['帽子', '头饰'], category: 'headwear' },
  { words: ['足球球衣', '球衣', '队服'], category: 'jersey' },
  { words: ['电子产品', '数码'], category: 'electronics' },
  { words: ['无线耳机', '蓝牙耳机', '耳机'], terms: ['earbud', 'headphone', 'earphone'] },
  { words: ['鼠标'], terms: ['mouse'] },
  { words: ['音箱'], terms: ['speaker'] },
  { words: ['袜子'], terms: ['sock'] },
  { words: ['双肩包', '背包'], terms: ['backpack', 'rucksack'] },
  { words: ['配饰', '饰品', '配件'], category: 'accessories' },
  { words: ['套装'], category: 'ShortSets' },
  { words: ['黑色'], terms: ['black'] },
  { words: ['白色'], terms: ['white'] },
  { words: ['灰色'], terms: ['gray', 'grey'] },
  { words: ['蓝色'], terms: ['blue'] },
  { words: ['红色'], terms: ['red'] },
];

const lookup = new Map(aliases.flatMap(rule => rule.words.map(word => [word, rule])));
const pattern = new RegExp([...lookup.keys()].sort((a, b) => b.length - a.length).join('|'), 'gu');

function normalize(text) {
  return text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export const englishSearchHelp = 'Search by English product name, Weidian ID or link.';
export const chineseSearchHelp = '支持常用中文商品词，例如：连帽卫衣、运动鞋、球衣。';

export function queryTerms(value) {
  const rules = new Set();
  const remaining = normalize(value).replace(pattern, match => {
    rules.add(lookup.get(match));
    return ' ';
  });
  return { words: remaining.trim().split(/\s+/).filter(Boolean), rules: [...rules] };
}

export function searchMatches(product, query) {
  const name = normalize(product.name);
  return query.words.every(word => name.includes(word) || product.weidianId.includes(word)) &&
    query.rules.every(rule => rule.category === product.category || rule.terms?.some(term => name.includes(term)));
}
