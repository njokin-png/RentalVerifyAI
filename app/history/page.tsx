import { DemoTable } from "@/components/DemoTable";
export default function History() {
  return (
    <div className="container py-12">
      <p className="eyebrow">SCAN HISTORY</p>
      <h1 className="text-3xl font-extrabold mt-2 mb-8">Your investigations</h1>
      <DemoTable />
    </div>
  );
}
