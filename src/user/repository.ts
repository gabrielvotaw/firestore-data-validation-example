import { db, invalidDocument } from "../firestore";
import { User } from "./model";

interface UserRepository {
  getUser(id: string): Promise<User | null>
}

export class FirestoreUserRepository implements UserRepository {
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
      console.log(doc);
      const data = doc.data();
      // if document is marked as invalid, skip it
      if (data !== invalidDocument) {
        users.push(data);
      }
    });
    return users;
  }

  private _collection() {
    return db.users;
  }

  private _doc(id: string) {
    return this._collection().doc(id);
  }
}