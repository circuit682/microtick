export class IntaSendError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "IntaSendError";
  }
}