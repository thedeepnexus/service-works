// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment

import "server-only";
// ✅ Next.js의 서버 전용 API 모듈로 설정 (클라이언트에서 임포트 불가)

import { headers } from "next/headers";
// ✅ Next.js의 서버에서 요청 헤더를 가져오는 함수 (App Router 환경에서 사용)

import admin from "firebase-admin";
// ✅ Firebase Admin SDK를 서버에서 사용

import { serviceAccount } from "./config";
// ✅ Firebase 설정을 불러옴 (서버에서 사용)

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function getAuthenticatedAppForUser() {
  const idToken = (await headers()).get("Authorization")?.split("Bearer ")[1];

  let currentUser = null;
  if (idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      currentUser = await admin.auth().getUser(decodedToken.uid);
    } catch (error) {
      console.error("Error verifying ID token:", error);
    }
  }

  return {
    firebaseServerApp: admin.app(),
    currentUser,
  };
}
