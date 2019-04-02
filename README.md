# Test Cloud Firestore Security Rules using Cloud Firestore emulator

- [Test your Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Firebase CLI](https://firebase.google.com/docs/cli/)
- [@firebase/testing](https://www.npmjs.com/package/@firebase/testing)

## Inspired

- https://techlife.cookpad.com/entry/2018/11/05/143000
- https://github.com/sgr-ksmt/firestore-emulator-rules-test
- https://github.com/firebase/quickstart-nodejs/tree/master/firestore-emulator/typescript-quickstart

## Setup the Firestore emulator

```
npm install -g firebase-tools
firebase setup:emulators:firestore
```

## Setup Java

```
java -version
```

If Java runtime does not present, you needs to install.

[Java SE Downloads](https://www.oracle.com/technetwork/java/javase/downloads/index.html)

## Start the firestore emulator (and leave it running during the tests)

```
firebase serve --only firestore
```

## Run tests

```
npm run test
```