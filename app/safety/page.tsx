import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rental scam safety tips",
  description:
    "Practical steps to verify a rental property, contact, and payment request before sharing money or personal information.",
  alternates: { canonical: "/safety" },
};

const tips = [
  "Tour the property in person or by a live video call before paying.",
  "Look up ownership through the relevant county or city property records.",
  "Contact a management company using details from its official website—not only the listing.",
  "Avoid wire transfers, gift cards, cryptocurrency, and other hard-to-reverse payments.",
  "Do not send Social Security, banking, or identity documents before verifying the recipient and purpose.",
  "Compare the address, photos, price, and contact details across multiple listing websites.",
];
export default function Safety() {
  return (
    <div className="container max-w-4xl py-16">
      <p className="eyebrow">RENTER SAFETY</p>
      <h1 className="text-4xl font-extrabold mt-2">
        Protect yourself before sending money
      </h1>
      <div className="grid md:grid-cols-2 gap-5 mt-10">
        {tips.map((t, i) => (
          <div className="card p-6" key={t}>
            <b className="text-teal">0{i + 1}</b>
            <p className="font-semibold mt-2">{t}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-500 mt-8">
        If you believe you lost money or exposed sensitive information, contact
        the payment provider, relevant financial institutions, and local
        authorities promptly.
      </p>
    </div>
  );
}
