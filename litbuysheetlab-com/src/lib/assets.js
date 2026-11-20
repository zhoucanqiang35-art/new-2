import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const versions=new Map();
export function asset(path){if(!versions.has(path))versions.set(path,createHash('sha256').update(readFileSync(resolve('public',path.replace(/^\//,'')))).digest('hex').slice(0,12));return path+'?v='+versions.get(path);}
