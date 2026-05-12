import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/access-control";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role < 10) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { name, alias, id_family, place, ico } = await req.json();
    if (!name || !alias) {
      return NextResponse.json({ error: "Name and Alias are required" }, { status: 400 });
    }

    const result = await query(
      "UPDATE breeds SET name = $1, alias = $2, id_family = $3, place = $4, ico = $5 WHERE id = $6 RETURNING *",
      [name, alias, id_family, place, ico, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Breed not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role < 10) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Check if animals are linked to this breed
    const checkResult = await query("SELECT count(*) FROM goats_data WHERE id_breed = $1", [id]);
    if (parseInt(checkResult.rows[0].count) > 0) {
      return NextResponse.json({ error: "Cannot delete breed with linked animals" }, { status: 400 });
    }

    await query("DELETE FROM breeds WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
