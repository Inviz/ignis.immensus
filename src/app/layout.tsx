import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="white" />
        <link
          href="https://fonts.googleapis.com/css2?family=Marcellus+SC&display=swap&family=PT+Sans+Narrow&family=Saira+Extra+Condensed:wght@600"
          rel="stylesheet"
        ></link>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
