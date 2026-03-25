import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();

  // Helper to handle empty values as null for numeric/date fields
  const val = (v: any) => (v === "" || v === undefined ? null : v);

  try {
    // Check if assessment already exists for this goat
    // Note: We use COUNT or just id_goat to avoid relying on an 'id' column which might not exist
    const check = await query("SELECT id_goat FROM goats_test WHERE id_goat = $1 LIMIT 1", [id]);
    
    if (check.rows.length > 0) {
      // Update
      await query(
        `UPDATE goats_test SET 
          who_expert = $1, 
          date_test = $2, 
          test_type = $3, 
          par_1 = $4, 
          par_2 = $5, 
          par_3 = $6, 
          par_4 = $7, 
          weight = $8, 
          score_total = $9, 
          "class" = $10, 
          category = $11
        WHERE id_goat = $12`,
        [
          val(data.who_expert), val(data.date_test), val(data.test_type), 
          val(data.par_1), val(data.par_2), val(data.par_3), val(data.par_4), 
          val(data.weight), val(data.score_total), val(data.class_val), val(data.category),
          id
        ]
      );
    } else {
      // Insert
      await query(
        `INSERT INTO goats_test (
          id_goat, who_expert, date_test, test_type, 
          par_1, par_2, par_3, par_4, 
          weight, score_total, "class", category
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          id, val(data.who_expert), val(data.date_test), val(data.test_type), 
          val(data.par_1), val(data.par_2), val(data.par_3), val(data.par_4), 
          val(data.weight), val(data.score_total), val(data.class_val), val(data.category)
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Database error while saving assessment:", error);
    return NextResponse.json({ 
      error: "Failed to save assessment", 
      details: error.message,
      query_error: error.hint || error.detail
    }, { status: 500 });
  }
}
