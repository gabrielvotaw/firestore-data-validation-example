import { type TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import dotenv from 'dotenv';
import admin, { firestore as fs } from 'firebase-admin';
import path from 'path';
import { config } from './config';
import { User, userSchema } from './user/model';
import { getValidationErrorMessage } from './util/validation';

dotenv.config({ path: path.join(__dirname, '../.env') });

// init firestore
admin.initializeApp({ projectId: process.env.PROJECT_ID });
const firestore = admin.firestore();

// placeholder for invalid documents
export const invalidDocument = Symbol('invalid firestore document');

const converter = <T>(schema: TSchema): fs.FirestoreDataConverter<T | typeof invalidDocument> => ({
  toFirestore: (
    data: fs.PartialWithFieldValue<T | typeof invalidDocument>,
  ): fs.PartialWithFieldValue<fs.DocumentData> => data as fs.PartialWithFieldValue<fs.DocumentData>,
  fromFirestore: (
    snapshot: fs.QueryDocumentSnapshot<fs.DocumentData>,
  ): T | typeof invalidDocument => {
    const data = snapshot.data();
    // check that the document obeys our defined schema
    const isValid = Value.Check(schema, data);
    if (isValid) {
      // if it respects our schema, return the data as the corresponding type
      return data as T;
    } else {
      // if it does not respect our schema, log the error and mark it as invalid. this document can't be used safely
      const errMessage = getValidationErrorMessage(schema, data);
      console.error(`invalid document: ${errMessage}`);
      return invalidDocument;
    }
  }
});

// provide the schema and the concrete type to the converter to perform data validation
const dataPoint = <T>(schema: TSchema, collection: string) => firestore
  .collection(collection)
  .withConverter(converter<T>(schema));

// define the data points (collections)
export const db = {
  users: dataPoint<User>(userSchema, config.usersCollection),
}