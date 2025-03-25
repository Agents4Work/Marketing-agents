/**
 * Firebase Implementation with ESM/CommonJS Compatibility
 * 
 * This file provides a simplified mock implementation of the Firebase Admin SDK
 * for local development without connecting to a real Firebase instance.
 * It's designed to be compatible with both ESM and CommonJS environments.
 */

// Mock document reference
class DocumentRef {
  private name: string;
  private id: string;
  
  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
  
  async get() {
    return {
      exists: true,
      data: () => ({ id: this.id, name: 'Mock Document' }),
      id: this.id
    };
  }
  
  async set(data: any) {
    console.log('🔄 Mock Firestore: Setting document', this.name, this.id, data);
    return this;
  }
  
  async update(data: any) {
    console.log('🔄 Mock Firestore: Updating document', this.name, this.id, data);
    return this;
  }
  
  async delete() {
    console.log('🔄 Mock Firestore: Deleting document', this.name, this.id);
    return this;
  }
}

// Mock query
class Query {
  async get() {
    return {
      empty: false,
      docs: [
        {
          id: 'mock-id-1',
          data: () => ({ name: 'Mock Document 1' }),
        },
        {
          id: 'mock-id-2',
          data: () => ({ name: 'Mock Document 2' }),
        },
      ],
    };
  }
  
  orderBy() {
    return this;
  }
  
  where() {
    return this;
  }
}

// Mock collection reference
class CollectionRef {
  private name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  doc(id = 'mock-id') {
    return new DocumentRef(this.name, id);
  }
  
  where() {
    return new Query();
  }
  
  orderBy() {
    return new Query();
  }
}

// Mock batch
class WriteBatch {
  set() {
    return this;
  }
  
  update() {
    return this;
  }
  
  delete() {
    return this;
  }
  
  async commit() {
    console.log('🔄 Mock Firestore: Committing batch');
    return;
  }
}

// Mock Firebase admin object with proper structure
const admin: any = {
  initializeApp: () => {
    console.log('🔄 Mock Firebase Admin SDK initialized');
    return {};
  },
  
  auth: () => ({
    createUser: async (userData: any) => {
      console.log('🔄 Mock Firebase Auth: Creating user', userData);
      return {
        uid: 'mock-user-' + Math.random().toString(36).substring(2, 8),
        email: userData.email,
        displayName: userData.displayName || userData.email.split('@')[0],
        photoURL: userData.photoURL || null,
      };
    },
    getUser: async (uid: string) => {
      console.log('🔄 Mock Firebase Auth: Getting user', uid);
      return {
        uid,
        email: 'mock@example.com',
        displayName: 'Mock User',
        photoURL: null,
      };
    },
    getUserByEmail: async (email: string) => {
      console.log('🔄 Mock Firebase Auth: Getting user by email', email);
      return {
        uid: 'mock-user-' + Math.random().toString(36).substring(2, 8),
        email,
        displayName: email.split('@')[0],
        photoURL: null,
      };
    },
    updateUser: async (uid: string, userData: any) => {
      console.log('🔄 Mock Firebase Auth: Updating user', uid, userData);
      return {
        uid,
        ...userData,
      };
    },
    verifyIdToken: async (token: string) => {
      console.log('🔄 Mock Firebase Auth: Verifying token', token);
      return {
        uid: 'mock-user-' + Math.random().toString(36).substring(2, 8),
        email: 'mock@example.com',
        name: 'Mock User',
      };
    },
    createCustomToken: async (uid: string) => {
      console.log('🔄 Mock Firebase Auth: Creating custom token for', uid);
      return 'mock-token-' + Math.random().toString(36).substring(2, 15);
    },
  }),
  
  firestore: () => {
    return {
      collection: (name: string) => new CollectionRef(name),
      batch: () => new WriteBatch()
    };
  },
  
  credential: {
    cert: () => ({}),
  }
};

// Add FieldValue to the firestore object
admin.firestore.FieldValue = {
  serverTimestamp: () => new Date(),
};

// For convenience, create pre-initialized instances
const db = admin.firestore();
const auth = admin.auth();

// Mock verification function
const verifyIdToken = async (idToken: string) => {
  console.log('🔄 Mock verifyIdToken:', idToken);
  return {
    uid: 'dev-user-123',
    email: 'dev@example.com',
    name: 'Development User',
  };
};

// Export the mock implementations
export { admin, auth, db, verifyIdToken };