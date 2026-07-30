import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { createOutlet, listOutlets, outletMobileExists } from "@/lib/outlets";
import { C_AND_F } from "@/features/outlet-tracker/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  const outlets = await listOutlets(auth.id, auth.role);
  return NextResponse.json({ outlets });
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const str = (v: unknown) => String(v ?? "").trim();

  const name = str(body.name);
  if (!name) {
    return NextResponse.json({ error: "Counter name is required." }, { status: 400 });
  }

  const mobile = str(body.mobile);
  if (await outletMobileExists(mobile)) {
    return NextResponse.json(
      {
        error:
          "A counter with this mobile number already exists. Add a visit to it instead.",
      },
      { status: 409 },
    );
  }

  const outlet = await createOutlet(
    {
      name,
      mobile,
      address: str(body.address),
      area: str(body.area),
      depot: str(body.depot),
      // C&F is a single fixed location; default it if the client omits it.
      headQuarter: str(body.headQuarter) || C_AND_F,
      type: str(body.type),
      typeOther: str(body.typeOther),
      lat: str(body.lat),
      lng: str(body.lng),
    },
    auth.id,
  );

  return NextResponse.json({ outlet });
}
