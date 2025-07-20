import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gemini AI Chatbot",
  description:
    "A beautiful chatbot powered by Next.js, Tailwind CSS, and the Gemini API.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-gray-900 text-gray-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
