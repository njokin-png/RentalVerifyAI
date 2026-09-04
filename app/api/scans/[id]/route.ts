import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteOwnedScan } from "@/services/scans/repository";

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    const deleted = await deleteOwnedScan(params.id, session.userId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Saved investigation not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Saved investigation deletion is temporarily unavailable." },
      { status: 503 },
    );
  }
}
