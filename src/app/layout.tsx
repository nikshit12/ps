import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Folio Research · Holdings comparison",
  description: "Compare portfolio holdings and export an evidence-linked factsheet.",
};

export default function Layout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
