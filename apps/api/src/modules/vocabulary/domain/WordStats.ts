import { Result } from "../../../shared/core/Result";
import { ValueObject } from "../../../shared/core/ValueObject";

export type WordStatsProps = {
  reviewCount: number;
  nextReviewDate: Date | null;
};

export class WordStats extends ValueObject<WordStatsProps> {
  private constructor(props: WordStatsProps) {
    super(props);
  }

  get reviewCount(): number {
    return this.props.reviewCount;
  }

  get nextReviewDate(): Date | null {
    return this.props.nextReviewDate;
  }

  public static create(props?: Partial<WordStatsProps>): Result<WordStats> {
    const reviewCount = props?.reviewCount ?? 0;
    if (!Number.isInteger(reviewCount) || reviewCount < 0) {
      return Result.fail("reviewCount must be a non-negative integer");
    }
    const nextReviewDate = props?.nextReviewDate ?? null;
    return Result.ok(new WordStats({ reviewCount, nextReviewDate }));
  }
}

