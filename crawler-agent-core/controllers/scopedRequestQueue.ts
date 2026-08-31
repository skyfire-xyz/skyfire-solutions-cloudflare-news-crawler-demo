import { Configuration, EventType, RequestQueue } from "crawlee";
import { MAX_REQUESTS } from "./types";

const DEDUP_CACHE_SLOTS = Math.max(4096, MAX_REQUESTS * 16);
const QUEUE_EVENTS = [EventType.MIGRATING, EventType.ABORTING];

interface DedupCache {
  size: number;
  clear: () => void;
}

export interface ScopedRequestQueue {
  requestQueue: RequestQueue;
  release: () => Promise<void>;
}

function shrinkDedupCache(requestQueue: RequestQueue): void {
  const cache = (requestQueue as unknown as { requestSeenCache?: DedupCache })
    .requestSeenCache;
  if (
    cache &&
    typeof cache.size === "number" &&
    cache.size > DEDUP_CACHE_SLOTS
  ) {
    cache.size = DEDUP_CACHE_SLOTS;
    cache.clear();
  }
}

export async function openScopedRequestQueue(
  name: string,
): Promise<ScopedRequestQueue> {
  const events = Configuration.getGlobalConfig().getEventManager();
  const preexisting = new Map(
    QUEUE_EVENTS.map((event) => [event, new Set(events.listeners(event))]),
  );

  const requestQueue = await RequestQueue.open(name);
  shrinkDedupCache(requestQueue);

  const release = async (): Promise<void> => {
    try {
      await requestQueue.drop();
    } finally {
      shrinkDedupCache(requestQueue);
      for (const event of QUEUE_EVENTS) {
        const before = preexisting.get(event);
        for (const listener of events.listeners(event)) {
          if (!before?.has(listener)) {
            events.off(event, listener);
          }
        }
      }
    }
  };

  return { requestQueue, release };
}
