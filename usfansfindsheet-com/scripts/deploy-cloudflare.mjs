import { spawnSync } from 'node:child_process';
import { releaseInfo, releaseMessage } from './release-info.mjs';

const revision = releaseInfo();
const message = releaseMessage(revision);
console.log('Deploying:', message);
const deploy = spawnSync(
  process.execPath,
  ['node_modules/wrangler/bin/wrangler.js', 'deploy', '--message', message, ...process.argv.slice(2)],
  { stdio: 'inherit' },
);
if (deploy.error) throw deploy.error;
process.exitCode = deploy.status ?? 1;
