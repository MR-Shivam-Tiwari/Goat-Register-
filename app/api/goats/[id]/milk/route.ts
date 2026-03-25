import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();

  // Helper to handle empty values as null for numeric fields
  const val = (v: any) => (v === "" || v === undefined ? null : v);

  try {
    // Check if record for this lactation number already exists for this goat
    // par_0 is lact_no
    const check = await query(
      "SELECT id FROM goats_milk WHERE id_goat = $1 AND par_0 = $2 LIMIT 1",
      [id, val(data.par_0)]
    );

    if (check.rows.length > 0) {
      // Update existing record
      await query(
        `UPDATE goats_milk SET 
          par_1 = $1, par_2 = $2, par_3 = $3, par_4 = $4, par_5 = $5, 
          par_6 = $6, par_7 = $7, par_8 = $8, par_9 = $9, 
          have_graph = $10, source = $11
        WHERE id = $12`,
        [
          val(data.par_1), val(data.par_2), val(data.par_3), val(data.par_4), val(data.par_5),
          val(data.par_6), val(data.par_7), val(data.par_8), val(data.par_9),
          val(data.have_graph), val(data.source),
          check.rows[0].id
        ]
      );
    } else {
      // Insert new record
      await query(
        `INSERT INTO goats_milk (
          id_goat, par_0, par_1, par_2, par_3, par_4, par_5, 
          par_6, par_7, par_8, par_9, have_graph, source
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          id, val(data.par_0), val(data.par_1), val(data.par_2), val(data.par_3), val(data.par_4), val(data.par_5),
          val(data.par_6), val(data.par_7), val(data.par_8), val(data.par_9),
          val(data.have_graph), val(data.source)
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Database error while saving milk data:", error);
    return NextResponse.json({ 
      error: "Failed to save milk productivity", 
      details: error.message 
    }, { status: 500 });
  }
}
