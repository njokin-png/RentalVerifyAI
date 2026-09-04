import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteUserScans } from "@/services/scans/repository";

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    const deleted = await deleteUserScans(session.userId);
    return NextResponse.json({ deleted });
  } catch {
    return NextResponse.json(
      { error: "Saved investigation deletion is temporarily unavailable." },
      { status: 503 },
    );
  }
}
