import { NextResponse } from "next/server";
import { demoScans } from "@/lib/demo";
export async function GET() {
  return NextResponse.json(demoScans);
}
