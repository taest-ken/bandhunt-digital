import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fred's India Tour Before The India Tour // THE HITMAP",
  description: "An episodic digital scavenger hunt across India powered by beats and basslines. Move Fred, follow the beat, find the last seen location of fredagain India tour bands.",
  icons: {
    icon: "/assets/stickers/site_icon.png",
    shortcut: "/assets/stickers/site_icon.png",
    apple: "/assets/stickers/site_icon.png",
  },
  openGraph: {
    title: "Fred's India Tour Before The India Tour // THE HITMAP",
    description: "An episodic digital scavenger hunt across India powered by beats and basslines. Move Fred, follow the beat, find the last seen location of fredagain India tour bands.",
    url: "https://bandhunt.taest.in",
    siteName: "Bandhunt by taest.club",
    images: [
      {
        url: "/assets/stickers/site_icon.png",
        width: 512,
        height: 512,
        alt: "Bandhunt by taest.club",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Fred's India Tour Before The India Tour // THE HITMAP",
    description: "An episodic digital scavenger hunt across India powered by beats and basslines. Move Fred, follow the beat, find the last seen location of fredagain India tour bands.",
    images: ["/assets/stickers/site_icon.png"],
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
