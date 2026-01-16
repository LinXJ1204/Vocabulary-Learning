import { Entity } from "../../../shared/core/Entity";
import { Result } from "../../../shared/core/Result";
import { ReviewSchedulePolicy } from "./ReviewSchedulePolicy";
import { WordExample } from "./WordExample";
import { WordInfo } from "./WordInfo";
import { WordStats } from "./WordStats";
import { WordText } from "./WordText";

export type WordProps = {
  userId: string;
  text: WordText;
  info: WordInfo;
  examples: WordExample[];
  stats: WordStats;
  createdAt: Date;
};

export type CreateWordProps = {
  userId: string;
  text: string;
  info: {
    definition: string;
    partOfSpeech?: string | null;
    phonetic?: string | null;
  };
  examples?: Array<{ id?: string; example: string; translation: string }>;
  stats?: Partial<{ reviewCount: number; nextReviewDate: Date | null }>;
  createdAt?: Date;
};

export class Word extends Entity<WordProps> {
  private constructor(props: WordProps, id?: string) {
    super(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }

  get text(): string {
    return this.props.text.value;
  }

  get info(): WordInfo {
    return this.props.info;
  }

  get examples(): WordExample[] {
    return [...this.props.examples];
  }

  get stats(): WordStats {
    return this.props.stats;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  public updateInfo(info: {
    definition: string;
    partOfSpeech?: string | null;
    phonetic?: string | null;
  }): Result<void> {
    const infoOrError = WordInfo.create(info);
    if (infoOrError.isFailure) return Result.fail(infoOrError.error!);
    this.props.info = infoOrError.getValue();
    return Result.ok();
  }

  public addExample(example: string, translation: string): Result<WordExample> {
    const exOrError = WordExample.create({ example, translation });
    if (exOrError.isFailure) return Result.fail(exOrError.error!);
    const ex = exOrError.getValue();
    this.props.examples.push(ex);
    return Result.ok(ex);
  }

  public removeExampleById(exampleId: string): Result<void> {
    const idx = this.props.examples.findIndex((e) => e.id === exampleId);
    if (idx === -1) return Result.fail("Example not found");
    this.props.examples.splice(idx, 1);
    return Result.ok();
  }

  /**
   * Record a review and schedule the next review date.
   * Domain takes in 'now' to keep it deterministic/testable.
   */
  public recordReview(now: Date): Result<void> {
    if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
      return Result.fail("now is invalid");
    }

    const nextReviewCount = this.props.stats.reviewCount + 1;
    const nextReviewDate = ReviewSchedulePolicy.nextReviewDate(now, nextReviewCount);

    const statsOrError = WordStats.create({
      reviewCount: nextReviewCount,
      nextReviewDate
    });
    if (statsOrError.isFailure) return Result.fail(statsOrError.error!);

    this.props.stats = statsOrError.getValue();
    return Result.ok();
  }

  public static create(props: CreateWordProps, id?: string): Result<Word> {
    const userId = props.userId?.trim();
    if (!userId) return Result.fail("userId is required");

    const textOrError = WordText.create(props.text);
    if (textOrError.isFailure) return Result.fail(textOrError.error!);

    const infoOrError = WordInfo.create(props.info);
    if (infoOrError.isFailure) return Result.fail(infoOrError.error!);

    const statsOrError = WordStats.create(props.stats);
    if (statsOrError.isFailure) return Result.fail(statsOrError.error!);

    const examples: WordExample[] = [];
    for (const ex of props.examples ?? []) {
      const exOrError = WordExample.create(
        { example: ex.example, translation: ex.translation },
        ex.id
      );
      if (exOrError.isFailure) return Result.fail(exOrError.error!);
      examples.push(exOrError.getValue());
    }

    const createdAt = props.createdAt ?? new Date();
    if (Number.isNaN(createdAt.getTime())) return Result.fail("createdAt is invalid");

    return Result.ok(
      new Word(
        {
          userId,
          text: textOrError.getValue(),
          info: infoOrError.getValue(),
          examples,
          stats: statsOrError.getValue(),
          createdAt
        },
        id
      )
    );
  }
}

