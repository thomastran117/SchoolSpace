/**
 * @file validationUtility.ts
 * @description
 * Comprehensive validation and sanitization utilities for common fields.
 *
 * @module utility
 * @version 1.0.0
 * @auth Thomas
 */

import { httpError } from "./httpUtility";

/* -------------------------------------------------------------
 * Email Validation
 * ----------------------------------------------------------- */

/**
 * Utility: Validates email format.
 *
 * @param email - The email to validate.
 * @returns True if valid, false otherwise.
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/* -------------------------------------------------------------
 * Positive Integer Validation
 * ----------------------------------------------------------- */

/**
 * Validates that a value is a positive integer.
 *
 * @param value - The value to validate.
 * @param name - Optional field name for error messages (default: "id").
 * @returns The validated integer value.
 * @throws {Error} If the value is not a positive integer.
 */
export function validatePositiveInt(
  value: string | number,
  name = "id",
): number {
  const num = Number(value);

  if (!Number.isInteger(num) || num <= 0) {
    httpError(400, `${name} must be a positive integer`);
  }

  return num;
}

/**
 * Optionally validates a positive integer, returns undefined if invalid.
 *
 * @param value - The value to validate.
 * @returns The integer or undefined if invalid.
 */
export function optionalValidateId(value: string | number): number | undefined {
  const num = Number(value);

  if (!Number.isInteger(num) || num <= 0) {
    return undefined;
  }

  return num;
}

/* -------------------------------------------------------------
 * Boolean Validation
 * ----------------------------------------------------------- */

/**
 * Converts a string or boolean to a normalized boolean value.
 *
 * @param value - The value to validate.
 * @returns The parsed boolean.
 */
export function isBoolean(value: string | boolean): boolean {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
  }

  return false;
}

/* -------------------------------------------------------------
 * Text / String Validation
 * ----------------------------------------------------------- */

/**
 * Validates and sanitizes a text field that should contain only letters and spaces.
 */
export function validateString(
  value: string | undefined | null,
  fieldName: string,
  maxLength = 50,
  minLength = 2,
): string | undefined {
  if (value === undefined || value === null) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed.length < minLength) {
    httpError(
      400,
      `${fieldName} must be at least ${minLength} characters long.`,
    );
  }

  if (trimmed.length > maxLength) {
    httpError(400, `${fieldName} must not exceed ${maxLength} characters.`);
  }

  const allowedPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
  if (!allowedPattern.test(trimmed)) {
    const invalidChar = trimmed
      .split("")
      .find((ch) => !allowedPattern.test(ch));
    httpError(
      400,
      `${fieldName} contains invalid character "${invalidChar}". Only letters, spaces, apostrophes, and hyphens are allowed.`,
    );
  }

  return trimmed;
}

/**
 * Validates and sanitizes an alphanumeric string with letters, numbers, spaces, or basic punctuation.
 */
export function validateAlphaNumericString(
  value: string | undefined | null,
  fieldName: string,
  maxLength = 50,
  minLength = 2,
): string | undefined {
  if (value === undefined || value === null) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed.length < minLength) {
    httpError(
      400,
      `${fieldName} must be at least ${minLength} characters long.`,
    );
  }

  if (trimmed.length > maxLength) {
    httpError(400, `${fieldName} must not exceed ${maxLength} characters.`);
  }

  const allowedPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s'-]+$/;
  if (!allowedPattern.test(trimmed)) {
    const invalidChar = trimmed
      .split("")
      .find((ch) => !allowedPattern.test(ch));
    httpError(
      400,
      `${fieldName} contains invalid character "${invalidChar}". Only letters, numbers, spaces, apostrophes, and hyphens are allowed.`,
    );
  }

  return trimmed;
}

/* -------------------------------------------------------------
 * Phone Validation
 * ----------------------------------------------------------- */

/**
 * Validates and sanitizes a phone number.
 */
export function validatePhone(
  value: string | undefined | null,
  fieldName = "Phone",
  maxLength = 20,
  minLength = 7,
): string | undefined {
  if (value === undefined || value === null) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed.length < minLength) {
    httpError(
      400,
      `${fieldName} must be at least ${minLength} characters long.`,
    );
  }

  if (trimmed.length > maxLength) {
    httpError(400, `${fieldName} must not exceed ${maxLength} characters.`);
  }

  const allowedPattern = /^[\d\s()+-]+$/;
  if (!allowedPattern.test(trimmed)) {
    const invalidChar = trimmed
      .split("")
      .find((ch) => !allowedPattern.test(ch));
    httpError(
      400,
      `${fieldName} contains invalid character "${invalidChar}". Only digits, spaces, '+', '-', and parentheses are allowed.`,
    );
  }

  const digitCount = (trimmed.match(/\d/g) || []).length;
  if (digitCount < 7) {
    httpError(400, `${fieldName} must contain at least 7 digits.`);
  }

  return trimmed;
}

/* -------------------------------------------------------------
 * Address Validation
 * ----------------------------------------------------------- */

/**
 * Validates and sanitizes a street or mailing address.
 */
export function validateAddress(
  value: string | undefined | null,
  fieldName = "Address",
  maxLength = 100,
  minLength = 5,
): string | undefined {
  if (value === undefined || value === null) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed.length < minLength) {
    httpError(
      400,
      `${fieldName} must be at least ${minLength} characters long.`,
    );
  }

  if (trimmed.length > maxLength) {
    httpError(400, `${fieldName} must not exceed ${maxLength} characters.`);
  }

  const allowedPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s,.'-]+$/;
  if (!allowedPattern.test(trimmed)) {
    const invalidChar = trimmed
      .split("")
      .find((ch) => !allowedPattern.test(ch));
    httpError(
      400,
      `${fieldName} contains invalid character "${invalidChar}". Only letters, numbers, spaces, commas, periods, apostrophes, and hyphens are allowed.`,
    );
  }

  return trimmed;
}
