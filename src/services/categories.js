import { orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { DEFAULT_CATEGORIES } from '../lib/constants';
import { listen, userCollection, userDoc } from './firestore';

const COLLECTION = 'categories';

export const subscribeCategories = (onData, onError) =>
  listen(query(userCollection(COLLECTION), orderBy('name')), onData, onError);

/** The slug is the document id, so saving the same name twice is a no-op. */
const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const saveCategory = (name) =>
  setDoc(userDoc(COLLECTION, slugify(name)), { name, createdAt: serverTimestamp() });

/** Built-in categories, then saved custom ones, with "Other" kept last. */
export function mergeCategories(custom) {
  const builtIn = DEFAULT_CATEGORIES.filter((name) => name !== 'Other');
  const seen = new Set(DEFAULT_CATEGORIES.map((name) => name.toLowerCase()));
  const extra = [];

  for (const { name } of custom) {
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      extra.push(name);
    }
  }
  return [...builtIn, ...extra, 'Other'];
}
