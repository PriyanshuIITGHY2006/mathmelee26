import type { Metadata } from "next";
import FinalistSetup from "./FinalistSetup";

export const metadata: Metadata = {
  title: "Profile Setup — Mathematics Melee",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <FinalistSetup />;
}
