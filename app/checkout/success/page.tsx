import { CheckoutConfirmation } from "@/components/CheckoutConfirmation";
export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  return (
    <div className="container max-w-xl py-20 text-center">
      <p className="eyebrow">CHECKOUT STATUS</p>
      <h1 className="text-4xl font-extrabold mt-2">Confirm your purchase</h1>
      <CheckoutConfirmation sessionId={session_id} />
    </div>
  );
}
