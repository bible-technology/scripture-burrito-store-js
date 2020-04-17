
import path from 'path';
import { createFSBurritoStore } from '../fs_burrito_store';

let store;
// see https://blog.sourcerer.io/complete-introduction-to-async-functions-and-es6-modules-in-node-js-9f59887ba531
export default async function () {
  if (!store) {
    try {
      store = await createFSBurritoStore(
        {
          storeClass: 'FSBurritoStore',
        },
        path.join(__dirname, 'some_burritos'),
      );
    } catch (e) {
      // Deal with the fact the chain failed
    }
  }
  return store;
}
