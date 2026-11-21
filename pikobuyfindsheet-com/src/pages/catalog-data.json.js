import data from '../data/catalog.json';
import {createHash} from 'node:crypto';
export function GET(){
  const imageIndexKey = createHash('sha256').update(data.items.map(({path}) => path).join('\n')).digest('hex');
  return Response.json({...data, imageIndexKey});
}
