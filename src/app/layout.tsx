import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fred's India Tour Before The India Tour // THE HITMAP",
  description: "An episodic digital scavenger hunt across India powered by beats and basslines. Drag the compass, listen to the music, track down Fred before the real tour drops.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.0.0/dist/maplibre-gl.css" />
      </head>
      <body className="antialiased bg-[#050505] text-[#ededed] overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
