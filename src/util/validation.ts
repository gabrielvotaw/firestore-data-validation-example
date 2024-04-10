import { type TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export function getValidationErrorMessage(schema: TSchema, data: any): string {
  return [...Value.Errors(schema, data)]
    .map((err) => `${err.message} for path '${err.path}' but found '${err.value}'`)
    .join(' ');
}