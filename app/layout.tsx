import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { OfflineIndicator } from "@/components/offline-indicator";
import { Providers } from "@/components/providers";

const robotoHeading = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F5A623",
};

export const metadata: Metadata = {
  title: "Evolucent",
  description: "A transparent evolution of how citizens fund change",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Evolucent",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full font-sans antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        robotoHeading.variable
      )}
    >
      <body className={cn("min-h-full flex flex-col")}>
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <OfflineIndicator />
        </Providers>
      </body>
    </html>
  );
}
