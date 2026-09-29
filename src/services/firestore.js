import { collection, doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// All business data lives under the signed-in account: users/{uid}/{collection}.
export const userCollection = (name) => collection(db, 'users', auth.currentUser.uid, name);

export const userDoc = (name, id) => doc(userCollection(name), id);

/** Live-subscribes to a query and emits plain `{ id, ...data }` records. Returns the unsubscribe function. */
export const listen = (query, onData, onError) =>
  onSnapshot(
    query,
    (snapshot) => onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  );
