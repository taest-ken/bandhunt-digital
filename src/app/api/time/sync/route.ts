import { NextResponse } from "next/server";


export async function GET() {
  return NextResponse.json(
    {
      serverEpoch: Date.now(),
      iso: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
