/**
 * Very simple spaced repetition policy (can be replaced later).
 * Interval is chosen based on next review count (after recording a review).
 */
export class ReviewSchedulePolicy {
  private static readonly intervalsDays = [1, 3, 7, 14, 30, 60];

  public static nextReviewDate(now: Date, nextReviewCount: number): Date {
    const idx = Math.min(
      Math.max(nextReviewCount - 1, 0),
      ReviewSchedulePolicy.intervalsDays.length - 1
    );
    const days = ReviewSchedulePolicy.intervalsDays[idx];
    const ms = days * 24 * 60 * 60 * 1000;
    return new Date(now.getTime() + ms);
  }
}

