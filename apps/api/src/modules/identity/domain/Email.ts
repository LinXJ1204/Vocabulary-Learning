import { Result } from "../../../shared/core/Result";
import { ValueObject } from "../../../shared/core/ValueObject";

type EmailProps = { value: string };

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(raw: string): Result<Email> {
    const value = raw?.trim().toLowerCase();
    if (!value) return Result.fail("Email is required");

    // Practical, not perfect, email validation.
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!ok) return Result.fail("Email is invalid");

    return Result.ok(new Email({ value }));
  }
}

