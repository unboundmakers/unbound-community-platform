function validateCollection(collection) {
  if (typeof collection !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,99}$/.test(collection)) {
    throw new TypeError('Provide a single collection name using letters, digits, underscores or hyphens');
  }
}

function validateDocumentId(id) {
  if (typeof id !== 'string' || !id || id === '.' || id === '..' || id.includes('/') || Buffer.byteLength(id, 'utf8') > 1500) {
    throw new TypeError('Provide a nonempty document ID without a path');
  }
}

class FirestoreDocumentStore {
  constructor(firestore, collection) {
    validateCollection(collection);
    this.firestore = firestore;
    this.collection = collection;
  }

  reference(id) {
    validateDocumentId(id);
    return this.firestore.collection(this.collection).doc(id);
  }

  async get(id) {
    const snapshot = await this.reference(id).get();
    return snapshot.exists ? snapshot.data() : null;
  }

  async createOnce(id, document) {
    const reference = this.reference(id);
    if (!document || typeof document !== 'object' || Array.isArray(document)) {
      throw new TypeError('Document must be an object');
    }
    return this.firestore.runTransaction(async transaction => {
      const previous = await transaction.get(reference);
      if (previous.exists) return {created: false, value: previous.data()};
      transaction.create(reference, document);
      return {created: true, value: document};
    });
  }
}

function createDocumentStore({enabled = false, projectId, collection, firestore} = {}) {
  if (enabled !== true) throw new Error('Cloud access must be explicitly enabled');
  if (typeof projectId !== 'string' || !projectId.trim()) throw new Error('Provide a Google Cloud project ID');
  validateCollection(collection);
  const client = firestore || new (require('@google-cloud/firestore').Firestore)({projectId});
  return new FirestoreDocumentStore(client, collection);
}

module.exports = {createDocumentStore};
