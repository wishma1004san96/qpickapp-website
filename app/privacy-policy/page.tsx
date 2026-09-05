import type { Metadata } from "next";
import { PrivacyPolicyContent } from "@/components/pages/privacy-policy-content";

export const metadata: Metadata = {
  title: {
    absolute: "Quick Pick Privacy Policy",
  },
  description:
    "Read the Quick Pick Privacy Policy to learn how we collect, use, protect, and manage your personal information.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
