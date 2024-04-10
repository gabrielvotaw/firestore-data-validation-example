import { config } from "../config";
import { db, firestore, invalidDocument } from "../firestore";
import { User } from "./model";

interface UserRepository {
  getUser(id: string): Promise<User | null>
}

export class FirestoreUserRepository implements UserRepository {
  // argument to bypass validation added for demonstration purposes
  async addUser(user: Omit<User, 'id'>, bypassValidation: boolean = false): Promise<User> {
    if (bypassValidation) {
      const dref = firestore.collection(config.usersCollection).doc();
      const newUser: User = { ...user, id: dref.id };
      await dref.set(newUser);
      return newUser;
    }

    const dref = this._doc();
    const newUser: User = { ...user, id: dref.id };
    await dref.set(newUser);
    return newUser;
  }

  async getUser(id: string): Promise<User | null> {
    const dsnap = await this._doc(id).get();
    const data = dsnap.data();
    // if document is marked as invalid, it isn't safe to use
    return data !== invalidDocument ? data ?? null : null;
  }

  async getAllUsers(): Promise<User[]> {
    const qsnap = await this._collection().get();
    const users: User[] = [];
    qsnap.docs.forEach((doc) => {
      const data = doc.data();
      // skip invalid documents
      if (data !== invalidDocument) {
        users.push(data);
      }
    });
    return users;
  }

  async deleteAllUsers(): Promise<void> {
    await firestore.recursiveDelete(this._collection());
  }

  private _collection() {
    return db.users;
  }

  private _doc(id?: string) {
    return id ? this._collection().doc(id) : this._collection().doc();
  }
}