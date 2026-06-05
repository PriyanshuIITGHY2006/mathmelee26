import type { Metadata } from "next";
import FinalistsClient from "./FinalistsClient";

export const metadata: Metadata = {
  title: "The Finalists — Mathematics Melee",
  robots: { index: false, follow: false },
};

export default function FinalistsPage() {
  return <FinalistsClient />;
}
