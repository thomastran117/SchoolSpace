/**
 * @file repositoryError.ts
 * @description
 * Custom error class for the repository layer
 *
 * @module error
 * @version 1.0.0
 * @auth Thomas
 */

class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause: unknown
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export { RepositoryError };
