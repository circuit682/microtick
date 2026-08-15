export interface CredentialEncryptor {
  encrypt(value: string): string;

  decrypt(value: string): string;
}
