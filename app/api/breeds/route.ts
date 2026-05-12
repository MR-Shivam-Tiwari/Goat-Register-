import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/access-control";

export async function GET() {
  try {
    const result = await query("SELECT id, name, alias, id_family, place, ico FROM breeds ORDER BY place ASC, name ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role < 10) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, alias, id_family, place, ico } = await req.json();
    if (!name || !alias) {
      return NextResponse.json({ error: "Name and Alias are required" }, { status: 400 });
    }

    const result = await query(
      "INSERT INTO breeds (name, alias, id_family, place, ico) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, alias, id_family || 1, place || 0, ico || '']
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
