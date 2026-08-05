import { isValidDate } from "./isValidDate";
import { parse as parser } from "./parse";

export interface ValidateDateOptions {
  date: string | number | Date;
  parse?: (value: string | number | Date) => Date | undefined;
  errorMessage?: string;
}

export function validateDate({
  date,
  parse = parser,
  errorMessage = `Invalid Date: "${date}"`,
}: ValidateDateOptions): Date {
  const d = parse(date);
  if (!isValidDate(d)) {
    throw new Error(`${errorMessage}: "${date}"`);
  }
  return d;
}
