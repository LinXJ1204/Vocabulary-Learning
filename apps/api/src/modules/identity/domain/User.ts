import { Entity } from "../../../shared/core/Entity";
import { Result } from "../../../shared/core/Result";
import { Email } from "./Email";
import type { UserRole } from "./UserRole";

export type UserProps = {
  email: Email;
  googleId?: string | null;
  role: UserRole;
};

export type CreateUserProps = {
  email: string;
  googleId?: string | null;
  role?: UserRole;
};

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  get email(): string {
    return this.props.email.value;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get googleId(): string | null {
    return this.props.googleId ?? null;
  }

  public changeRole(newRole: UserRole): Result<void> {
    if (newRole === this.props.role) return Result.ok();
    this.props.role = newRole;
    return Result.ok();
  }

  public linkGoogleAccount(googleId: string): Result<void> {
    const value = googleId?.trim();
    if (!value) return Result.fail("googleId is required");
    if (this.props.googleId && this.props.googleId !== value) {
      return Result.fail("googleId already linked");
    }
    this.props.googleId = value;
    return Result.ok();
  }

  public unlinkGoogleAccount(): Result<void> {
    this.props.googleId = null;
    return Result.ok();
  }

  public static create(props: CreateUserProps, id?: string): Result<User> {
    const emailOrError = Email.create(props.email);
    if (emailOrError.isFailure) return Result.fail(emailOrError.error!);

    const role: UserRole = props.role ?? "user";

    const googleId = props.googleId?.trim();
    if (props.googleId != null && !googleId) {
      return Result.fail("googleId is invalid");
    }

    return Result.ok(
      new User(
        {
          email: emailOrError.getValue(),
          role,
          googleId: googleId ?? null
        },
        id
      )
    );
  }
}

