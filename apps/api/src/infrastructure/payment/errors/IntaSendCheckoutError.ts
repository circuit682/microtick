import { IntaSendError } from "./IntaSendError.js";

export class IntaSendCheckoutError extends IntaSendError {
  constructor(message: string) {
    super(message);

    this.name = "IntaSendCheckoutError";
  }
}