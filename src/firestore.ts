import { type TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import dotenv from 'dotenv';
import admin, { firestore as fs } from 'firebase-admin';
import path from 'path';
import { config } from './config';
import { User, userSchema } from './user/model';
import { getValidationErrorMessage } from './util/validation';

dotenv.config({ path: path.join(__dirname, '../.env') });

admin.initializeApp({ projectId: process.env.PROJECT_ID });
export const firestore = admin.firestore();

// placeholder for invalid documents
export const invalidDocument = Symbol('invalid firestore document');

function validateData<T>(
  schema: TSchema,
  data: fs.PartialWithFieldValue<T | typeof invalidDocument>
): { isValid: boolean, errMessage: string | null } {
  // check that the document obeys the schema
  const isValid = Value.Check(schema, data);

  if (!isValid) {
    const errMessage = getValidationErrorMessage(schema, data);
    console.error(`invalid document: ${errMessage}`)
    return { isValid: false, errMessage };
  }

  return { isValid: true, errMessage: null };
}

const converter = <T>(schema: TSchema): fs.FirestoreDataConverter<T | typeof invalidDocument> => ({
  toFirestore: (
    data: fs.PartialWithFieldValue<T | typeof invalidDocument>,
  ): fs.PartialWithFieldValue<fs.DocumentData> => {
    const validationResult = validateData(schema, data);

    if (!validationResult.isValid) {
      // reject requests to add invalid data to firestore
      throw Error(`cannot add invalid document: ${validationResult.errMessage}`);
    }

    return data as fs.PartialWithFieldValue<fs.DocumentData>
  },
  fromFirestore: (
    snapshot: fs.QueryDocumentSnapshot<fs.DocumentData>,
  ): T | typeof invalidDocument => {
    const data = snapshot.data();
    const validationResult = validateData(schema, data);
    // if this document respects our schema, return the data as the corresponding concrete type.
    // otherwise, mark it as invalid. this document can't be used safely
    return validationResult.isValid ? data as T : invalidDocument;
  }
});

const dataPoint = <T>(schema: TSchema, collection: string) => firestore
  .collection(collection)
  .withConverter(converter<T>(schema));

export const db = {
  users: dataPoint<User>(userSchema, config.usersCollection),
}