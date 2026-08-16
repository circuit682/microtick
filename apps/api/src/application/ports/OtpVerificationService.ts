export interface OtpVerificationService {
  verify(phoneNumber: string, code: string): Promise<boolean>;
}