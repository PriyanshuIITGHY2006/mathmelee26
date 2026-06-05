import type { Metadata } from "next";
import FinalistProfileClient from "./FinalistProfileClient";

export const metadata: Metadata = {
  title: "Your Profile — Mathematics Melee",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <FinalistProfileClient />;
}
