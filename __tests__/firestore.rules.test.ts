import * as firebase from "@firebase/testing";
import * as fs from "fs";
import { v4 } from "uuid";

const projectIdBase = "firestore-emulator-example-" + Date.now();
const rules = fs.readFileSync("firestore.rules", "utf8");
let testNumber = 0;
const getProjectId = () => `${projectIdBase}-${testNumber}`;
const uid = v4();
const adminUid = v4();
const anotherUid = v4();
const notAnonymous = { sign_in_provider: "not-anonymous" };
const defaultAuth = { uid, firebase: notAnonymous };
const anonymousAuth = {
  uid: adminUid,
  admin: true,
  firebase: { sign_in_provider: "anonymous" }
};
const anotherUidAuth = {
  uid: anotherUid,
  firebase: notAnonymous
};
const adminAuth = {
  uid: adminUid,
  admin: true,
  firebase: notAnonymous
};
const roomId = v4();
const anotherRoomId = v4();
const admin = firebase
  .initializeAdminApp({ projectId: getProjectId() })
  .firestore();

const authedApp = (
  auth: undefined | { uid: string } | { uid: string; admin: null | boolean }
) =>
  firebase
    .initializeTestApp({
      projectId: getProjectId(),
      auth
    })
    .firestore();

describe("firestore.rules", () => {
  beforeEach(async () => {
    // Create new project ID for each test.
    testNumber++;
    await firebase.loadFirestoreRules({
      projectId: getProjectId(),
      rules
    });
  });

  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });

  describe("/users/{user}", () => {
    const collection = "users";
    const data = { foo: "bar" };

    describe("create", () => {
      test("should not let logged out users create", async () => {
        const db = authedApp(undefined);
        const user = db.collection(collection).doc(uid);
        await firebase.assertFails(user.set(data));
      });

      test("should not let logged in users create", async () => {
        const db = authedApp(defaultAuth);
        const user = db.collection(collection).doc(uid);
        await firebase.assertFails(user.set(data));
      });

      test("should not let admin create", async () => {
        const db = authedApp(adminAuth);
        const user = db.collection(collection).doc(uid);
        await firebase.assertFails(user.set(data));
      });
    });

    describe("read", () => {
      test("should not let logged out users read", async () => {
        const db = authedApp(undefined);
        const user = db.collection(collection).doc(uid);
        await firebase.assertFails(user.get());
      });

      test("should not let anonymous user", async () => {
        const db = authedApp(anonymousAuth);
        const user = db.collection(collection).doc(uid);
        await firebase.assertFails(user.get());
      });

      test("should only let logged in users read own", async () => {
        const db = authedApp(defaultAuth);
        const user = db.collection(collection).doc(uid);
        await firebase.assertSucceeds(user.get());

        const anotherUser = db.collection(collection).doc(anotherUid);
        await firebase.assertFails(anotherUser.get());
      });

      test("should not let admin read", async () => {
        const db = authedApp(adminAuth);
        const user = db.collection(collection).doc(uid);
        await firebase.assertFails(user.get());
      });
    });

    describe("update", () => {
      beforeEach(async () => {
        await admin
          .collection(collection)
          .doc(uid)
          .set(data);
      });

      test("should not let logged out users update", async () => {
        const db = authedApp(undefined);
        const user = db.collection(collection).doc(uid);
        await firebase.assertFails(user.update(data));
      });

      test("should not let logged in users update own", async () => {
        const db = authedApp(defaultAuth);
        const user = db.collection(collection).doc(uid);
        await firebase.assertFails(user.update(data));
      });

      test("should not let admin update", async () => {
        const db = authedApp(adminAuth);
        const user = db.collection(collection).doc(uid);
        await firebase.assertFails(user.update(data));
      });
    });

    describe("delete", () => {
      test("should not let logged out users delete", async () => {
        const db = authedApp(undefined);
        const user = db.collection(collection).doc(uid);
        await firebase.assertFails(user.delete());
      });

      test("should not let logged in users delete own", async () => {
        const db = authedApp(defaultAuth);
        const user = db.collection(collection).doc(uid);
        await firebase.assertFails(user.delete());
      });

      test("should not let admin delete", async () => {
        const db = authedApp(adminAuth);
        const user = db.collection(collection).doc(uid);
        await firebase.assertFails(user.delete());
      });
    });
  });

  describe("/admins/{admin}", () => {
    const collection = "admins";
    const data = { foo: "bar" };

    describe("create", () => {
      test("should not let logged out users create", async () => {
        const db = authedApp(undefined);
        const adminDoc = db.collection(collection).doc(uid);
        await firebase.assertFails(adminDoc.set(data));
      });

      test("should not let logged in users create", async () => {
        const db = authedApp(defaultAuth);
        const adminDoc = db.collection(collection).doc(uid);
        await firebase.assertFails(adminDoc.set(data));
      });

      test("should not let admin create", async () => {
        const db = authedApp(adminAuth);
        const adminDoc = db.collection(collection).doc(uid);
        await firebase.assertFails(adminDoc.set(data));
      });
    });

    describe("read", () => {
      test("should not let logged out users read", async () => {
        const db = authedApp(undefined);
        const adminDoc = db.collection(collection).doc(uid);
        await firebase.assertFails(adminDoc.get());
      });

      test("should not let logged in users read own", async () => {
        const db = authedApp(defaultAuth);
        const adminDoc = db.collection(collection).doc(uid);
        await firebase.assertFails(adminDoc.get());
      });

      test("should only let admin read", async () => {
        const db = authedApp(adminAuth);
        const adminDoc = db.collection(collection).doc(uid);
        await firebase.assertSucceeds(adminDoc.get());
      });
    });

    describe("update", () => {
      beforeEach(async () => {
        await admin
          .collection(collection)
          .doc(uid)
          .set(data);
      });

      test("should not let logged out users update", async () => {
        const db = authedApp(undefined);
        const adminDoc = db.collection(collection).doc(uid);
        await firebase.assertFails(adminDoc.update(data));
      });

      test("should not let logged in users update own", async () => {
        const db = authedApp(defaultAuth);
        const adminDoc = db.collection(collection).doc(uid);
        await firebase.assertFails(adminDoc.update(data));
      });

      test("should not let admin update", async () => {
        const db = authedApp(adminAuth);
        const adminDoc = db.collection(collection).doc(uid);
        await firebase.assertFails(adminDoc.update(data));
      });
    });

    describe("delete", () => {
      test("should not let logged out users delete", async () => {
        const db = authedApp(undefined);
        const adminDoc = db.collection(collection).doc(uid);
        await firebase.assertFails(adminDoc.delete());
      });

      test("should not let logged in users delete own", async () => {
        const db = authedApp(defaultAuth);
        const adminDoc = db.collection(collection).doc(uid);
        await firebase.assertFails(adminDoc.delete());
      });

      test("should not let admin delete", async () => {
        const db = authedApp(adminAuth);
        const adminDoc = db.collection(collection).doc(uid);
        await firebase.assertFails(adminDoc.delete());
      });
    });
  });

  describe("/rooms/{room}", () => {
    const collection = "rooms";
    const ownerData = {
      name: "owner name",
      owner: uid
    };
    const anotherOwnerData = {
      name: "another owner name",
      owner: anotherUid
    };

    describe("create", () => {
      test("should not let logged out users create", async () => {
        const db = authedApp(undefined);
        const room = db.collection(collection).doc();
        await firebase.assertFails(room.set(ownerData));
      });

      test("should let logged in users create room that owner is themselves", async () => {
        const db = authedApp(defaultAuth);
        const room = db.collection(collection).doc();
        await firebase.assertSucceeds(room.set(ownerData));

        const anotherRoom = db.collection(collection).doc();
        await firebase.assertFails(anotherRoom.set(anotherOwnerData));
      });

      test("should request.resource.data.keys().hasAll(['owner', 'name'])", async () => {
        const invalidData = { owner: uid };
        const db = authedApp(defaultAuth);
        const room = db.collection(collection).doc();
        await firebase.assertFails(room.set(invalidData));
      });

      test("should request.resource.data.name is string", async () => {
        const invalidData = { ...ownerData, ...{ name: 123 } };
        const db = authedApp(defaultAuth);
        const room = db.collection(collection).doc();
        await firebase.assertFails(room.set(invalidData));
      });

      test("should request.resource.data.name.size() > 0", async () => {
        const invalidData = { ...ownerData, ...{ name: "" } };
        const db = authedApp(defaultAuth);
        const room = db.collection(collection).doc();
        await firebase.assertFails(room.set(invalidData));
      });

      test("should not let admin create", async () => {
        const db = authedApp(adminAuth);
        const room = db.collection(collection).doc();
        await firebase.assertFails(room.set(ownerData));
      });
    });

    describe("read", () => {
      beforeEach(async () => {
        const db = authedApp(defaultAuth);
        await db
          .collection(collection)
          .doc(roomId)
          .set(ownerData);

        const anotherDb = authedApp(anotherUidAuth);
        await anotherDb
          .collection(collection)
          .doc(anotherRoomId)
          .set(anotherOwnerData);
      });

      test("should not let logged out users read", async () => {
        const db = authedApp(undefined);
        const room = db.collection(collection).doc(roomId);
        await firebase.assertFails(room.get());
      });

      test("should let logged in users read own", async () => {
        const db = authedApp(defaultAuth);
        const room = db.collection(collection).doc(roomId);
        await firebase.assertSucceeds(room.get());

        const anotherRoom = db.collection(collection).doc(anotherRoomId);
        await firebase.assertFails(anotherRoom.get());
      });

      test("should only let admin read", async () => {
        const db = authedApp(adminAuth);
        const room = db.collection(collection).doc(uid);
        await firebase.assertSucceeds(room.get());
      });
    });

    describe("update", () => {
      const updateData = { name: "another name" };
      beforeEach(async () => {
        const db = authedApp(defaultAuth);
        await db
          .collection(collection)
          .doc(roomId)
          .set(ownerData);

        const anotherDb = authedApp(anotherUidAuth);
        await anotherDb
          .collection(collection)
          .doc(anotherRoomId)
          .set(anotherOwnerData);
      });

      test("should not let logged out users update", async () => {
        const db = authedApp(undefined);
        const room = db.collection(collection).doc(roomId);
        await firebase.assertFails(room.update(updateData));
      });

      test("should let logged in users update room that owner is themselves", async () => {
        const db = authedApp(defaultAuth);
        const room = db.collection(collection).doc(roomId);
        await firebase.assertSucceeds(room.update(updateData));

        const anotherRoom = db.collection(collection).doc(anotherRoomId);
        await firebase.assertFails(anotherRoom.update(updateData));
      });

      test("should request.resource.data.name is string", async () => {
        const invalidData = { ...ownerData, ...{ name: 123 } };
        const db = authedApp(defaultAuth);
        const room = db.collection(collection).doc(roomId);
        await firebase.assertFails(room.update(invalidData));
      });

      test("should request.resource.data.name.size() > 0", async () => {
        const invalidData = { ...ownerData, ...{ name: "" } };
        const db = authedApp(defaultAuth);
        const room = db.collection(collection).doc(roomId);
        await firebase.assertFails(room.update(invalidData));
      });

      test("should let admin update", async () => {
        const db = authedApp(adminAuth);
        const room = db.collection(collection).doc(roomId);
        await firebase.assertSucceeds(room.update(updateData));
      });

      test("should request.resource.data.owner does not change", async () => {
        const invalidData = { owner: "owner" };
        const db = authedApp(adminAuth);
        const room = db.collection(collection).doc(roomId);
        await firebase.assertFails(room.update(invalidData));
      });
    });

    describe("delete", () => {
      test("should not let logged out users delete", async () => {
        const db = authedApp(undefined);
        const room = db.collection(collection).doc(uid);
        await firebase.assertFails(room.delete());
      });

      test("should not let logged in users delete own", async () => {
        const db = authedApp(defaultAuth);
        const room = db.collection(collection).doc(uid);
        await firebase.assertFails(room.delete());
      });

      test("should not let admin delete", async () => {
        const db = authedApp(adminAuth);
        const room = db.collection(collection).doc(uid);
        await firebase.assertFails(room.delete());
      });
    });

    describe("/rooms/{room}/messages/{message}", () => {
      const subCollection = "messages";
      const roomMessageId = v4();
      const anotherRoomMessageId = v4();
      const data = { text: "text" };

      describe("create", () => {
        beforeEach(async () => {
          const db = authedApp(defaultAuth);
          await db
            .collection(collection)
            .doc(roomId)
            .set(ownerData);

          const anotherDb = authedApp(anotherUidAuth);
          await anotherDb
            .collection(collection)
            .doc(anotherRoomId)
            .set(anotherOwnerData);
        });

        test("should not let logged out users create", async () => {
          const db = authedApp(undefined);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertFails(message.set(data));
        });

        test("should let logged in users create room message that owner is themselves", async () => {
          const db = authedApp(defaultAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertSucceeds(message.set(data));
          const anotherMessage = db
            .collection(collection)
            .doc(anotherRoomId)
            .collection(subCollection)
            .doc(anotherRoomMessageId);
          await firebase.assertFails(anotherMessage.set(data));
        });

        test("should request.resource.data.keys().hasAll(['text'])", async () => {
          const invalidData = { foo: "bar" };
          const db = authedApp(defaultAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertFails(message.set(invalidData));
        });

        test("should request.resource.data.text is string", async () => {
          const invalidData = { ...ownerData, ...{ text: 123 } };
          const db = authedApp(defaultAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertFails(message.set(invalidData));
        });

        test("should request.resource.data.name.size() > 0", async () => {
          const invalidData = { ...ownerData, ...{ text: "" } };
          const db = authedApp(defaultAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId)
            .collection(collection)
            .doc();
          await firebase.assertFails(message.set(invalidData));
        });
      });

      describe("batched write", () => {
        test("should request.auth.uid == resource.data.owner on batch create", async () => {
          const db = authedApp(defaultAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertFails(message.set(data));

          const batch = db.batch();
          const ref = db.collection(collection).doc();
          batch.set(ref, ownerData);
          batch.set(ref.collection(subCollection).doc(), data);
          await firebase.assertSucceeds(batch.commit());

          const anotherDb = authedApp(anotherUidAuth);
          await anotherDb
            .collection(collection)
            .doc(anotherRoomId)
            .set(anotherOwnerData);

          const anotherBatch = db.batch();
          const anotherRef = db.collection(collection).doc(anotherRoomId);
          anotherBatch.set(anotherRef.collection(subCollection).doc(), data);
          await firebase.assertFails(anotherBatch.commit());
        });
      });

      describe("read", () => {
        beforeEach(async () => {
          const db = authedApp(defaultAuth);
          await db
            .collection(collection)
            .doc(roomId)
            .set(ownerData);
          await db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId)
            .set(data);

          const anotherDb = authedApp(anotherUidAuth);
          await anotherDb
            .collection(collection)
            .doc(anotherRoomId)
            .set(anotherOwnerData);
          await anotherDb
            .collection(collection)
            .doc(anotherRoomId)
            .collection(subCollection)
            .doc(anotherRoomMessageId)
            .set(data);
        });

        test("should not let logged out users read", async () => {
          const db = authedApp(undefined);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertFails(message.get());
        });

        test("should let logged in users read room message that owner is themselves", async () => {
          const db = authedApp(defaultAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertSucceeds(message.get());

          const anotherMessage = db
            .collection(collection)
            .doc(anotherRoomId)
            .collection(subCollection)
            .doc(anotherRoomMessageId);
          await firebase.assertFails(anotherMessage.get());
        });

        test("should let admin update", async () => {
          const db = authedApp(adminAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertSucceeds(message.get());
        });
      });

      describe("update", () => {
        beforeEach(async () => {
          const db = authedApp(defaultAuth);
          await db
            .collection(collection)
            .doc(roomId)
            .set(ownerData);
          await db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId)
            .set(data);
        });

        test("should not let logged out users update", async () => {
          const db = authedApp(undefined);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertFails(message.update(data));
        });

        test("should let logged in users update room message that owner is themselves", async () => {
          const db = authedApp(defaultAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertSucceeds(message.update(data));
        });

        test("should request.resource.data.text is string", async () => {
          const invalidData = { text: 123 };
          const db = authedApp(defaultAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertFails(message.update(invalidData));
        });

        test("should request.resource.data.name.size() > 0", async () => {
          const invalidData = { text: "" };
          const db = authedApp(defaultAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId)
            .collection(collection)
            .doc();
          await firebase.assertFails(message.set(invalidData));
        });

        test("should let admin update", async () => {
          const db = authedApp(adminAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertSucceeds(message.update(data));
        });
      });

      describe("delete", () => {
        beforeEach(async () => {
          const db = authedApp(defaultAuth);
          await db
            .collection(collection)
            .doc(roomId)
            .set(ownerData);
        });

        test("should not let logged out users delete", async () => {
          const db = authedApp(undefined);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertFails(message.delete());
        });

        test("should let logged in users delete", async () => {
          const db = authedApp(defaultAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertFails(message.delete());
        });

        test("should not let admin delete", async () => {
          const db = authedApp(adminAuth);
          const message = db
            .collection(collection)
            .doc(roomId)
            .collection(subCollection)
            .doc(roomMessageId);
          await firebase.assertFails(message.delete());
        });
      });
    });
  });
});
