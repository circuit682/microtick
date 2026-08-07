import { ErrorCode, ValidationError } from "@shared";

export interface ServiceLevelProps {
  name: string;
}

export class ServiceLevel {
  private constructor(private readonly props: ServiceLevelProps) {}

  static create(props: ServiceLevelProps): ServiceLevel {
    const name = props.name.trim();

    if (name.length === 0) {
      throw new ValidationError(
        ErrorCode.PLAN_INVALID_NAME,
        "Service level name cannot be empty.",
      );
    }

    return new ServiceLevel({
      name,
    });
  }

  static reconstitute(props: ServiceLevelProps): ServiceLevel {
    return new ServiceLevel(props);
  }

  get name(): string {
    return this.props.name;
  }

  equals(other: ServiceLevel): boolean {
    return this.name === other.name;
  }
}
