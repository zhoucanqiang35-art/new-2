import catalog from '../../public/data/catalog.json';
import qcPhotos from '../../public/data/qc-featured.json';

export const qcProducts = catalog.filter(({weidianId}) => qcPhotos[weidianId]?.images?.length);
export {qcPhotos};

export const buyerCategories = {
  shoes: {
    path: '/categories/shoes/',
    title: 'LoloBuy Shoes Spreadsheet',
    description: 'Browse Weidian sneakers, slides and clogs available to open on LoloBuy. Compare seller photos, size charts and warehouse inspection details.',
    selectedIds: ['6250', '5841', '5954', '5985', '5983', '5977', '5966', '5965'],
  },
  'hoodies-sweaters': {
    path: '/categories/hoodies-sweaters/',
    title: 'LoloBuy Hoodies & Sweaters Spreadsheet',
    description: 'Compare Weidian hoodies, crewnecks and knitwear for LoloBuy, including selected listings with saved warehouse QC photos.',
    selectedIds: ['8661', '8648', '8608', '7046'],
  },
};

export function categoryProducts(key, selectedIds) {
  const priority = new Set(selectedIds);
  const withQc = qcProducts.filter(item => item.category === key);
  const withPhotos = new Set(withQc.map(item => item.weidianId));
  return [...withQc, ...catalog.filter(item => item.category === key && priority.has(item.id) && !withPhotos.has(item.weidianId))];
}
