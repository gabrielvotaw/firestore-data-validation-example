import { FirestoreUserRepository } from "./user/repository";

// set these up in the emulator suite
const validUserId = 'XHuNzyXUuj9Bqby7GcUN';
const invalidUserId = 'w06fgTLvCihGTGhMkVJ8';

(async () => {
  const repo = new FirestoreUserRepository();

  const validUser = await repo.getUser(validUserId);
  console.log(validUser); // not null

  const invalidUser = await repo.getUser(invalidUserId);
  console.log(invalidUser); // null, error: "invalid document: Expected number for path '/age' but found '35'"

  const allUsers = await repo.getAllUsers();
  console.log(allUsers); // array of length 1, with valid user
})();