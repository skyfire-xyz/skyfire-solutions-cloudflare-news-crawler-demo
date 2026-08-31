import express from "express";
const router = express.Router();
import { crawlWebsite } from "../controllers/cheerioCrawler";
import { triggerEndCrawlMessage } from "../controllers/crawlerUtils";
import { stopAndRemoveCrawler } from "../controllers/crawlerRegistry";

router.route("/").post(async (req, res, next) => {
  try {
    const crawlerInfo = await crawlWebsite(req.body);
    await triggerEndCrawlMessage({
      totalPagesCrawled: crawlerInfo.results.length,
      totalTimeSeconds: crawlerInfo.totalTimeSeconds,
      totalTraversalSizeBytes: crawlerInfo.totalTraversalSizeBytes,
      channelId: req.body.channelId,
    });

    res.status(200).send("OK");
  } catch (error) {
    console.error("Crawl failed:", error);
    next(error);
  }
});

router.route("/stop").post(async (req, res, next) => {
  try {
    await stopAndRemoveCrawler(req.body.channelId, "user request");
    res.status(200).send("OK");
  } catch (error) {
    console.error("Failed to stop crawler:", error);
    next(error);
  }
});

export default router;
