import { RequestQueue } from "crawlee";
import { MAX_REQUESTS } from "./types";

const DEDUP_CACHE_SLOTS = Math.max(4096, MAX_REQUESTS * 16);

interface DedupCache {
  size: number;
  clear: () => void;
}

export interface ScopedRequestQueue {
  requestQueue: RequestQueue;
  release: () => Promise<void>;
}

function shrinkDedupCache(requestQueue: RequestQueue): void {
  try {
    const cache = (requestQueue as unknown as { requestSeenCache?: DedupCache })
      .requestSeenCache;
    if (
      !cache ||
      typeof cache.size !== "number" ||
      typeof cache.clear !== "function" ||
      cache.size <= DEDUP_CACHE_SLOTS
    ) {
      return;
    }
    const descriptor = Object.getOwnPropertyDescriptor(cache, "size");
    if (descriptor && !descriptor.writable) {
      return;
    }
    cache.size = DEDUP_CACHE_SLOTS;
    cache.clear();
  } catch (error) {
    console.warn(
      "Could not shrink the request queue dedup cache; continuing without it.",
      error,
    );
  }
}

export async function openScopedRequestQueue(
  name: string,
): Promise<ScopedRequestQueue> {
  const requestQueue = await RequestQueue.open(name);
  shrinkDedupCache(requestQueue);

  const release = async (): Promise<void> => {
    try {
      await requestQueue.drop();
    } finally {
      shrinkDedupCache(requestQueue);
    }
  };

  return { requestQueue, release };
}
