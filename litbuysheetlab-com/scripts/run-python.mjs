import { spawnSync } from 'node:child_process';
const choices=process.platform==='win32' ? [['py','-3'],['python'],['python3']] : [['python3'],['python']];
for(const [command,...prefix] of choices){
 const result=spawnSync(command,[...prefix,...process.argv.slice(2)],{stdio:'inherit'});
 if(result.error?.code==='ENOENT')continue;
 if(result.error)console.error(result.error.message);
 process.exit(result.status??1);
}
console.error('Python 3 is required for the translation pipeline.');process.exit(1);
