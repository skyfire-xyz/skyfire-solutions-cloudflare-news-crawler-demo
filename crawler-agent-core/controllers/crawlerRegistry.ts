import { CheerioCrawler } from "crawlee";

const runningCrawlers: Record<string, CheerioCrawler> = {};

export function addCrawler(channelId: string, crawler: CheerioCrawler) {
  runningCrawlers[`${channelId}`] = crawler;
}

export function getCurrentRunningCrawler(channelId: string) {
  return runningCrawlers[`${channelId}`];
}

export function stopAndRemoveCrawler(channelId: string, _errorMsg: string) {
  const crawler = getCurrentRunningCrawler(channelId);
  if (crawler) {
    crawler.teardown();
    delete runningCrawlers[`${channelId}`];
  } else {
    console.log("Crawler not found for channelId:", channelId);
  }
}
