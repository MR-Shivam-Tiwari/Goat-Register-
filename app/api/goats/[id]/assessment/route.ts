import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();

  // Helper to handle empty values as null for numeric/date fields
  const val = (v: any) => (v === "" || v === undefined || v === null ? null : v);

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
          category = $11,
          mark_wh = $12,
          mark_wk = $13,
          mark_og = $14,
          mark_gg = $15,
          mark_kd = $16,
          mark_dev = $17,
          mark_hsp = $18,
          mark_chest = $19,
          mark_krts = $20,
          mark_kti = $21,
          mark_hooves = $22,
          mark_udder = $23,
          mark_udder_f = $24,
          mark_udder_b = $25,
          mark_teats = $26,
          mark_scrotum = $27
        WHERE id_goat = $28`,
        [
          val(data.who_expert), val(data.date_test), val(data.test_type), 
          val(data.par_1), val(data.par_2), val(data.par_3), val(data.par_4), 
          val(data.weight), val(data.score_total), val(data.class_val), val(data.category),
          val(data.mark_wh), val(data.mark_wk), val(data.mark_og), val(data.mark_gg), val(data.mark_kd),
          val(data.mark_dev), val(data.mark_hsp), val(data.mark_chest), val(data.mark_krts), val(data.mark_kti),
          val(data.mark_hooves), val(data.mark_udder), val(data.mark_udder_f), val(data.mark_udder_b), val(data.mark_teats),
          val(data.mark_scrotum),
          id
        ]
      );
    } else {
      // Insert
      await query(
        `INSERT INTO goats_test (
          id_goat, who_expert, date_test, test_type, 
          par_1, par_2, par_3, par_4, 
          weight, score_total, "class", category,
          mark_wh, mark_wk, mark_og, mark_gg, mark_kd,
          mark_dev, mark_hsp, mark_chest, mark_krts, mark_kti,
          mark_hooves, mark_udder, mark_udder_f, mark_udder_b, mark_teats,
          mark_scrotum
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
          $23, $24, $25, $26, $27, $28
        )`,
        [
          id, val(data.who_expert), val(data.date_test), val(data.test_type), 
          val(data.par_1), val(data.par_2), val(data.par_3), val(data.par_4), 
          val(data.weight), val(data.score_total), val(data.class_val), val(data.category),
          val(data.mark_wh), val(data.mark_wk), val(data.mark_og), val(data.mark_gg), val(data.mark_kd),
          val(data.mark_dev), val(data.mark_hsp), val(data.mark_chest), val(data.mark_krts), val(data.mark_kti),
          val(data.mark_hooves), val(data.mark_udder), val(data.mark_udder_f), val(data.mark_udder_b), val(data.mark_teats),
          val(data.mark_scrotum)
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
