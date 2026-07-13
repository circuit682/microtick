export interface PlanProps {
  id: string;
  name: string;
  price: number;
  duration: number;
  active: boolean;
}

export class Plan {
  private readonly props: PlanProps;

  constructor(props: PlanProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): number {
    return this.props.price;
  }

  get duration(): number {
    return this.props.duration;
  }

  get active(): boolean {
    return this.props.active;
  }
}