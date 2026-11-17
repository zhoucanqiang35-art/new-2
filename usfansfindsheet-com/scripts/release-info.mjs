import { execFileSync } from 'node:child_process';

function readGit(...args) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

export function releaseInfo() {
  const sha = process.env.WORKERS_CI_COMMIT_SHA || process.env.CF_PAGES_COMMIT_SHA || readGit('rev-parse', 'HEAD');
  const revision = /^[a-f0-9]{40}$/i.test(sha) ? sha : null;
  const branch = process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH || readGit('branch', '--show-current') || null;
  return { revision, branch };
}

export function releaseMessage({ revision, branch }) {
  if (!revision) return 'USFans Findsheet manual release';
  const subject = readGit('show', '-s', '--format=%s', revision).slice(0, 160);
  const reference = [branch, revision.slice(0, 12)].filter(Boolean).join(' ');
  return subject ? `${subject} (${reference})` : `USFans Findsheet · ${reference}`;
}
