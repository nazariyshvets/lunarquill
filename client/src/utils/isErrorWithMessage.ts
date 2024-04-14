const isErrorWithMessage = (error: unknown): error is { message: string } =>
  typeof error === "object" &&
  error != null &&
  "message" in error &&
  typeof error.message === "string";

export default isErrorWithMessage;
