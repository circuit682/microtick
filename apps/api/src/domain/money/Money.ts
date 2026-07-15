export class Money {
  private constructor() {}

  static fromKES(amount: number): Money {
    if (Number.isNaN(amount)) {
  throw new Error("Money amount cannot be NaN.");
}
    if (amount < 0) {
      throw new Error("Money amount cannot be negative.");
    }

    return new Money();
  }
}