import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ARIA — Your AI Companion",
  description: "Adaptive Realtime Intelligence Agent",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Importmap — must be before any module scripts */}
        <script
          type="importmap"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              imports: {
                three: "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/",
                "three/examples/jsm/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/",
                talkinghead: "https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.4/modules/talkinghead.mjs",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        {children}

        {/* Load TalkingHead globally from CDN */}
        <Script
          id="load-talkinghead"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              import('https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.4/modules/talkinghead.mjs')
                .then(module => {
                  window.TalkingHead = module.TalkingHead;
                  console.log('✅ TalkingHead loaded from CDN');
                  window.dispatchEvent(new Event('talkinghead-loaded'));
                })
                .catch(err => {
                  console.error('❌ TalkingHead CDN load failed:', err);
                  window.dispatchEvent(new Event('talkinghead-error'));
                });
            `,
          }}
        />
      </body>
    </html>
  );
}