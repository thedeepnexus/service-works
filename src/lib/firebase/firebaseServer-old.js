// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment

import "server-only";
// ✅ Next.js의 서버 전용 API 모듈로 설정 (클라이언트에서 임포트 불가)

import { headers } from "next/headers";
// ✅ Next.js의 서버에서 요청 헤더를 가져오는 함수 (App Router 환경에서 사용)

import { initializeServerApp } from "firebase/app";
// ❌ 현재 Firebase SDK에는 `initializeServerApp`이 존재하지 않음 → `admin.initializeApp()`을 사용해야 함

import { firebaseConfig } from "./config";
// ✅ Firebase 설정을 불러옴 (서버에서 사용)

import { getAuth } from "firebase/auth";
// ❌ `firebase/auth`는 클라이언트 SDK → 서버에서는 `firebase-admin`을 사용해야 함

// 🔥 이 코드에는 몇 가지 오류가 있으므로 수정이 필요함 (아래에서 수정 버전을 제공)

export async function getAuthenticatedAppForUser() {
  // 🔍 함수 이름 뒤에 `()` 빠져있음 → 추가 필요
  const idToken = headers().get("Authorization")?.split("Bearer ")[1];
  // ✅ 요청 헤더에서 `Authorization` 값을 가져와 Firebase ID Token을 추출

  const firebaseServerApp = initializeServerApp(
    firebaseConfig,
    idToken
      ? {
          authIdToken: idToken,
        }
      : {}
  );
  // ❌ `initializeServerApp`은 Firebase SDK에 존재하지 않음 → 수정 필요
  // ✅ Firebase 서버 애플리케이션을 초기화하고, 인증 토큰을 전달하여 현재 사용자를 인증

  const auth = getAuth(firebaseServerApp);
  // ❌ `firebase/auth`는 클라이언트 SDK이므로 서버에서는 `firebase-admin`을 사용해야 함

  await auth.authStateReady();
  // ❌ `authStateReady()`는 존재하지 않는 함수 → `verifyIdToken()`을 사용해야 함

  return {
    firebaseServerApp,
    currentUser: auth.currentUser, // ❌ 서버에서는 `auth.currentUser`가 없음 → 수정 필요
  };
}
