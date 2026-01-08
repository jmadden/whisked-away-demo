// src/lib/cache/versions.js
import { kvGetJSON, kvSetJSON } from '@/lib/cache/kv';

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getCacheVersion(name) {
  const key = `cache:${name}:version`;
  const v = await kvGetJSON(key);
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function bumpCacheVersion(name) {
  const key = `cache:${name}:version`;
  const current = await getCacheVersion(name);
  const next = current + 1;

  // store for a long time so it doesn’t disappear in Upstash UI
  await kvSetJSON(key, next, { ttlSeconds: ONE_YEAR });
  return next;
}
