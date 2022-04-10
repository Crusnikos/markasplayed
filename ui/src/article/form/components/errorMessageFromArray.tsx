import { FieldError } from "react-hook-form";

export default function errorMessageFromArray(
  error: FieldError[] | undefined
): (string | undefined)[] {
  return (Array.isArray(error) ? error : [error])?.map((e) => e?.message);
}
