import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "@/lib/Provider";
import ReactRedux from "@/redux/ReactRedux";
import InitUser from "@/InitUser";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RYDEX | Book Cars, Bikes & Commercial Vehicles Online",
  description:
    "Book cars, bikes, and commercial vehicles with RYDEX, a trusted multi-vendor vehicle booking platform. Enjoy secure login, verified owners, transparent pricing, and a seamless booking experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Provider>
          <ReactRedux>
            {/* init user ka kaam bs itna h ki agr user login h toh wo uska data store me store kar dega */}
            <InitUser />
            {children}
          </ReactRedux>
        </Provider>
      </body>
    </html>
  );
}
