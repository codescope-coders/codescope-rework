export class ApiError extends Error {
  statusCode: number;
  /** Optional machine-readable code the client can map to localized copy. */
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
