import "server-only";
import { headers } from "next/headers";
import admin from "firebase-admin";

// Firebase Admin SDK 초기화 (서버에서만 실행)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

/**
 * 클라이언트의 Firebase 인증 상태를 반영하는 서버 측 함수
 */
export async function getAuthenticatedAppForUser() {
  const idToken = headers().get("Authorization")?.split("Bearer ")[1];

  if (!idToken) {
    return {
      firebaseServerApp: admin.app(),
      currentUser: null,
    };
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    return {
      firebaseServerApp: admin.app(),
      currentUser: decodedToken, // 인증된 사용자 정보
    };
  } catch (error) {
    console.error("Invalid Firebase ID Token", error);
    return {
      firebaseServerApp: admin.app(),
      currentUser: null,
    };
  }
}
