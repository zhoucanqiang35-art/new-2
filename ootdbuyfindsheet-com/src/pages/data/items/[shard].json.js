import { catalog } from '../../../lib/categories-at-build.mjs';
import { itemData } from '../../../lib/item-data-at-build.mjs';
import { itemShard } from '../../../lib/settings.mjs';

export function getStaticPaths() {
  const shards = new Map();
  for (const {weidianId:id} of catalog) {
    const key = itemShard(id);
    if (!shards.has(key)) shards.set(key,[]);
    shards.get(key).push(id);
  }
  return [...shards].map(([shard,ids])=>({params:{shard},props:{ids}}));
}

export function GET({props:{ids}}) {
  return Response.json(Object.fromEntries(ids.map(id=>[id,itemData(id)])));
}
