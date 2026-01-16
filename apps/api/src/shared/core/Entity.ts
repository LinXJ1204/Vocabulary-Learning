import { randomUUID } from "node:crypto";

export abstract class Entity<TProps> {
  protected readonly _id: string;
  protected readonly props: TProps;

  protected constructor(props: TProps, id?: string) {
    this._id = id ?? randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  public equals(object?: Entity<TProps>): boolean {
    if (object == null) return false;
    if (this === object) return true;
    if (!(object instanceof Entity)) return false;
    return this._id === object._id;
  }
}

