import { isValidDate } from "./isValidDate";
import {parse as parser} from './parse';

export interface ValidateDateOptions {
  date: string | number | Date;
  parse?: (value: string | number | Date) => Date | undefined;
  errorMessage?: string;
}

/**
 * validateDate
 * Verifies if a date is, or can be, a valid JS Date object
 * @param {string | number | Date} date - a value that can be converted to a Date object
 * @param {string} errorMessage - error message to throw if date is invalid
 * @returns Date
 */
export function validateDate({date, parse = parser, errorMessage = `Invalid Date: "${date}"`}: ValidateDateOptions): Date {
  const d = parse(date);
  if (!isValidDate(d)) {
    throw new Error(`${errorMessage}: "${date}"`);
  }
  return d;
}