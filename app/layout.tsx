// ================
// app/layout.tsx
// ================
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ADHD Harmony - Build Your $10K/Month Business",
  description:
    "Stop Self-Sabotaging And Finally Build That $10K/Month Business. Discover in 3 minutes why you always quit halfway.",
  keywords: "ADHD, entrepreneur, business, productivity, ADHD entrepreneur",
  openGraph: {
    title: "ADHD Harmony - Build Your $10K/Month Business",
    description:
      "Stop Self-Sabotaging And Finally Build That $10K/Month Business",
    images: ["/og-image.png"],
  },
  themeColor: "#FFD700",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);`,
          }}
        />
        <link
          rel="preload"
          href="https://scripts.converteai.net/f3ae95a0-ae37-43cb-a4df-9c965554bcfa/players/68e1ffaa1ae9afdf362a0a6b/v4/player.js"
          as="script"
        />
        <link
          rel="preload"
          href="https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js"
          as="script"
        />
        <link
          rel="preload"
          href="https://cdn.converteai.net/f3ae95a0-ae37-43cb-a4df-9c965554bcfa/68e1feaff0bf17a32636c657/main.m3u8"
          as="fetch"
        />
        <link rel="dns-prefetch" href="https://cdn.converteai.net" />
        <link rel="dns-prefetch" href="https://scripts.converteai.net" />
        <link rel="dns-prefetch" href="https://images.converteai.net" />
        <link rel="dns-prefetch" href="https://api.vturb.com.br" />
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        {children}
        <div id="modal-root"></div> {/* Add this */}
        <Analytics />
      </body>
    </html>
  );
}
