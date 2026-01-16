export abstract class ValueObject<TProps> {
  protected readonly props: TProps;

  protected constructor(props: TProps) {
    this.props = Object.freeze({ ...(props as any) }) as TProps;
  }

  public equals(vo?: ValueObject<TProps>): boolean {
    if (vo == null) return false;
    if (vo.props === undefined) return false;
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}

