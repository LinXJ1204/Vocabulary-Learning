import { Entity } from "../../../shared/core/Entity";
import { Result } from "../../../shared/core/Result";

export type WordExampleProps = {
  example: string;
  translation: string;
};

export class WordExample extends Entity<WordExampleProps> {
  private constructor(props: WordExampleProps, id?: string) {
    super(props, id);
  }

  get example(): string {
    return this.props.example;
  }

  get translation(): string {
    return this.props.translation;
  }

  public updateExample(example: string, translation: string): Result<void> {
    const ex = example?.trim();
    const tr = translation?.trim();
    if (!ex) return Result.fail("Example is required");
    if (!tr) return Result.fail("Example translation is required");
    this.props.example = ex;
    this.props.translation = tr;
    return Result.ok();
  }

  public static create(props: WordExampleProps, id?: string): Result<WordExample> {
    const ex = props.example?.trim();
    const tr = props.translation?.trim();
    if (!ex) return Result.fail("Example is required");
    if (!tr) return Result.fail("Example translation is required");
    return Result.ok(new WordExample({ example: ex, translation: tr }, id));
  }
}

