import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Movie Finder - Identify Any Movie from Description",
  description:
    "Describe any movie scene, plot, or character and instantly find what movie it is. Works with even the smallest hints and details.",
  keywords: "movie search, film finder, movie identifier, plot description, movie database, cinema search",
  authors: [{ name: "Movie Finder Team" }],
  openGraph: {
    title: "Movie Finder - Identify Any Movie from Description",
    description: "Describe any movie and find it instantly. Our advanced search works with minimal hints and details.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
