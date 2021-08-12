const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { v4: uuid } = require('uuid');
const logger = functions.logger;

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const usersCollection = db.collection( 'users' );

const hasUsers = async () => {
  const usersSnapshot = await usersCollection.limit( 1 ).get()
  .catch( err => {
    logger.error( err );
    Promise.reject( err );
  });

  return ( usersSnapshot.size === 1 );
}

const isValid = async ( userId, userKey ) => {
  if ( ! userId || ! userKey ) {
    logger.error( 'Invalid userId or userKey' );
    return false;
  }
  const usersSnapshot = await usersCollection
    .where("id", "==", userId)
    .where("key", "==", userKey)
    .where("isEnabled", "==", true)
    .get()
  .catch( err => {
    logger.error( err );
    return Promise.reject( err );
  });

  return ( usersSnapshot.size === 1 );
}

const add = async () => {
  const key = uuid();
  const userRef = usersCollection.doc();

  const result = await userRef.set({
    id: userRef.id,
    key: key,
    isEnabled: true
  })
  .catch( err => {
    logger.error("Error writing document: ", err);
    return false;
  });

  if ( ! result ) {
    return false;
  }

  const userDoc = await userRef.get()
  .catch( err => {
    logger.error( err );
    return false;
  });

  if ( ! userDoc ) {
    return false;
  }

  return userDoc.data();
}

exports.hasUsers = hasUsers;
exports.add = add;
exports.isValid = isValid;
