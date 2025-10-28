import { useEffect } from "react";
import { Platform } from "react-native";

// utils/kakao-web.ts
declare global {
  interface Window {
    Kakao?: any;
  }
}

let kakaoReady: Promise<any> | null = null;

export function useKakao() {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    // 이미 로드된 경우
    if (document.getElementById("kakao-sdk")) return;

    const script = document.createElement("script");
    script.id = "kakao-sdk";
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js";
    script.integrity =
      "sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if ((window as any).Kakao && !(window as any).Kakao.isInitialized()) {
        (window as any).Kakao.init(process.env.EXPO_PUBLIC_KAKAO_JS_KEY);
        console.log("✅ Kakao SDK initialized");
      }
    };
    document.head.appendChild(script);
  }, []);
}

function loadKakao(jsKey: string) {
  if (typeof window === "undefined") return Promise.reject("Not in browser");
  if (window.Kakao && window.Kakao.isInitialized?.())
    return Promise.resolve(window.Kakao);

  if (!kakaoReady) {
    kakaoReady = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js";
      s.crossOrigin = "anonymous";
      s.integrity =
        "sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm";
      s.onload = () => {
        try {
          if (!window.Kakao) return reject("Kakao not found");
          if (!window.Kakao.isInitialized()) window.Kakao.init(jsKey);
          resolve(window.Kakao);
        } catch (e) {
          reject(e);
        }
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return kakaoReady;
}

// features/share/kakaoShare.ts

export async function shareKakaoFeed({
  title,
  description,
  imageUrl,
  mobileWebUrl,
  webUrl,
}: {
  title: string;
  description?: string;
  imageUrl?: string;
  mobileWebUrl: string;
  webUrl: string;
}) {
  if (Platform.OS !== "web") throw new Error("Kakao JS SDK is web-only");

  const Kakao = await loadKakao(process.env.EXPO_PUBLIC_KAKAO_JS_KEY!);

  return Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description,
      imageUrl, // https여야 하고 외부에서 접근 가능해야 합니다.
      link: {
        mobileWebUrl, // 콘솔에 등록한 도메인과 정확히 일치
        webUrl,
      },
    },
    buttons: [
      {
        title: "웹으로 보기",
        link: { mobileWebUrl, webUrl },
      },
    ],
  });
}
