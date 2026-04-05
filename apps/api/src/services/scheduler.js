import { syncReviews } from "./reviewService.js";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export async function startSchedulers() {
  try {
    await syncReviews();
  } catch (error) {
    console.warn("Initial review sync skipped:", error.message);
  }

  setInterval(async () => {
    try {
      await syncReviews();
      console.log("Automatic Google review sync complete");
    } catch (error) {
      console.warn("Automatic review sync failed:", error.message);
    }
  }, SIX_HOURS_MS);
}
