import { User } from "./user/model";
import { FirestoreUserRepository } from "./user/repository";

(async () => {
  const repo = new FirestoreUserRepository();

  await repo.deleteAllUsers();

  const newValidUser = await repo.addUser({
    username: 'valid_user12',
    email: 'valid_user@email.com',
    age: 24,
    isEmailVerified: true,
  });
  const validUser = await repo.getUser(newValidUser.id);
  console.log(validUser); // not null


  await repo.addUser({
    username: 'invalid_user43',
    email: 'invalid_user@email.com',
    age: '36',
    isEmailVerified: false,
  } as any as Omit<User, 'id'>)
    .catch((err) => console.log(err)); // we expect this error


  const newInvalidUser = await repo.addUser({
    username: 'invalid_user43',
    email: 'invalid_user@email.com',
    age: '36',
    isEmailVerified: false,
  } as any as Omit<User, 'id'>, true); // bypass validation and force add the user
  const invalidUser = await repo.getUser(newInvalidUser.id);
  console.log(invalidUser); // null


  const allUsers = await repo.getAllUsers();
  console.log(allUsers); // array of length 1, with valid user. invalid document not returned
})();