import { initializeApp } from "firebase/app";
import { getAuth, getIdToken } from "firebase/auth";
import { getInstallations, getToken } from "firebase/installations";

// Firebase 설정 저장
let firebaseConfig;

self.addEventListener("install", (event) => {
  const serializedFirebaseConfig = new URL(location).searchParams.get("firebaseConfig");

  if (!serializedFirebaseConfig) {
    throw new Error("Firebase Config object not found in service worker query string.");
  }

  firebaseConfig = JSON.parse(serializedFirebaseConfig);
  console.log("Service Worker installed with Firebase config", firebaseConfig);
});

self.addEventListener("fetch", (event) => {
  const { origin } = new URL(event.request.url);
  if (origin !== self.location.origin) return;
  event.respondWith(fetchWithFirebaseHeaders(event.request));
});

// 인증 토큰을 요청 헤더에 자동 추가하는 함수
async function fetchWithFirebaseHeaders(request) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const installations = getInstallations(app);
  const headers = new Headers(request.headers);

  try {
    const [authIdToken, installationToken] = await Promise.all([
      getAuthIdToken(auth),
      getToken(installations),
    ]);

    if (authIdToken) headers.append("Authorization", `Bearer ${authIdToken}`);
    headers.append("Firebase-Instance-ID-Token", installationToken);

    const newRequest = new Request(request, { headers });
    return await fetch(newRequest);
  } catch (error) {
    console.error("Error adding Firebase authentication headers", error);
    return fetch(request); // 인증 헤더 추가 실패 시 기본 요청 실행
  }
}

// Firebase ID 토큰 가져오기
async function getAuthIdToken(auth) {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await getIdToken(user, true); // 강제 갱신
        resolve(token);
      } else {
        resolve(null);
      }
      unsubscribe();
    });
  });
}
