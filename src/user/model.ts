import { Type, type Static } from "@sinclair/typebox";

// define the expected shape of user documents
export const userSchema = Type.Object({
  id: Type.String(),
  username: Type.String(),
  email: Type.String(),
  age: Type.Number({ minimum: 0 }),
  isEmailVerified: Type.Boolean(),
});
// convert the schema into a concrete type
export type User = Static<typeof userSchema>;