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
  title: "MyPurposeProfile - Stop Overthinking and Finally Start Your Business",
  description:
    "For corporate professionals ready to escape. Discover in 3 minutes whether entrepreneurship fits you, which paths match your strengths, and how to start safely.",
  keywords:
    "purpose, entrepreneurship, career change, corporate escape, business clarity, AI assessment",
  openGraph: {
    title: "MyPurposeProfile - Discover Your Entrepreneurial Fit",
    description:
      "Stop overthinking and finally start your business. Reveal if entrepreneurship fits you, which paths to take, and how to begin safely.",
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
        <Analytics /> {/* Analytics */}
      </body>
    </html>
  );
}
