import { CheerioCrawler } from "crawlee";

const runningCrawlers: Record<string, CheerioCrawler> = {};

export function addCrawler(channelId: string, crawler: CheerioCrawler) {
  runningCrawlers[`${channelId}`] = crawler;
}

export function getCurrentRunningCrawler(channelId: string) {
  return runningCrawlers[`${channelId}`];
}

export function removeCrawler(channelId: string) {
  delete runningCrawlers[`${channelId}`];
}

export function stopAndRemoveCrawler(channelId: string, _errorMsg: string) {
  const crawler = getCurrentRunningCrawler(channelId);
  if (crawler) {
    delete runningCrawlers[`${channelId}`];
    return crawler.teardown();
  }
  console.log("Crawler not found for channelId:", channelId);
  return Promise.resolve();
}
