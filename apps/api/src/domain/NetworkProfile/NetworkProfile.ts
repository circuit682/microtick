import { ErrorCode, ValidationError } from "@shared";

export interface NetworkProfileProps {
  name: string;
  downloadMbps: number;
  uploadMbps: number;
}

export class NetworkProfile {
  private constructor(private readonly props: NetworkProfileProps) {}

  static create(props: NetworkProfileProps): NetworkProfile {
    const name = props.name.trim();

    if (name.length === 0) {
      throw new ValidationError(
        ErrorCode.PLAN_INVALID_NAME,
        "Network profile name cannot be empty.",
      );
    }

    if (!Number.isFinite(props.downloadMbps) || props.downloadMbps <= 0) {
      throw new ValidationError(
        ErrorCode.NETWORK_PROFILE_INVALID_DOWNLOAD,
        "Network profile download speed must be greater than zero.",
        {
          attemptedDownloadMbps: props.downloadMbps,
        },
      );
    }

    if (!Number.isFinite(props.uploadMbps) || props.uploadMbps <= 0) {
      throw new ValidationError(
        ErrorCode.NETWORK_PROFILE_INVALID_UPLOAD,
        "Network profile upload speed must be greater than zero.",
        {
          attemptedUploadMbps: props.uploadMbps,
        },
      );
    }

    return new NetworkProfile({
      name,
      downloadMbps: props.downloadMbps,
      uploadMbps: props.uploadMbps,
    });
  }

  static reconstitute(props: NetworkProfileProps): NetworkProfile {
    return new NetworkProfile(props);
  }

  get name(): string {
    return this.props.name;
  }

  get downloadMbps(): number {
    return this.props.downloadMbps;
  }

  get uploadMbps(): number {
    return this.props.uploadMbps;
  }

  equals(other: NetworkProfile): boolean {
    return (
      this.name === other.name &&
      this.downloadMbps === other.downloadMbps &&
      this.uploadMbps === other.uploadMbps
    );
  }
}
