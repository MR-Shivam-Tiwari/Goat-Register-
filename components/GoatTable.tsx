import Link from "next/link";

export default function GoatTable({
  goats,
  t,
  isMain,
}: {
  goats: any[];
  t: any;
  isMain?: boolean;
}) {
  return (
    <div className="overflow-x-auto w-full bg-white border border-gray-300 shadow-sm custom-scrollbar">
      <table className="w-full text-left border-collapse table-auto min-w-[7500px]">
        <thead className="sticky top-0 z-30 shadow-sm">
          {/* TOP HEADER - GROUPS */}
          <tr className="text-[8px] font-bold uppercase tracking-tight text-gray-700">
            <th
              colSpan={20}
              className="p-1 text-center border-r border-gray-100 bg-[#E2F0D9]"
            >
              Animal Information
            </th>
            <th
              colSpan={2}
              className="p-1 text-center border-r border-gray-100 bg-[#F2F2F2]"
            >
              Certificate
            </th>
            <th
              colSpan={8}
              className="p-1 text-center border-r border-gray-100 bg-[#C5E0B4]"
            >
              Mother's data
            </th>
            <th
              colSpan={8}
              className="p-1 text-center border-r border-gray-100 bg-[#F8CBAD]"
            >
              Father's details
            </th>
            <th
              colSpan={8}
              className="p-1 text-center border-r border-gray-100 bg-[#B4E0E0]"
            >
              Certification
            </th>
            <th
              colSpan={8}
              className="p-1 text-center border-r border-gray-100 bg-[#B4E0B4]"
            >
              Productivity
            </th>
            <th colSpan={4} className="p-1 text-center bg-[#F2F2F2]">
              Metadata
            </th>
          </tr>
          {/* BOTTOM HEADER - FIELDS */}
          <tr className="text-[8px] font-bold uppercase tracking-tight text-gray-700 border-b border-gray-300">
            <th className="p-1 border-r border-gray-300 sticky left-0 bg-[#E2F0D9] z-40 min-w-[200px]">
              {t.goats.nickname}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.breed}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.sex}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.abgMember}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.farm}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.breeder}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.owner}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.birthDate}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.birthWeight}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.bornQty}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.hornedness}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.genPassport}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.genetic}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.registryCode}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.idUa}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              {t.goats.idAbg}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              ID по ФХ
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              ID Chip
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              ID International
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#E2F0D9]/80">
              Brand
            </th>

            {/* Certificate Group */}
            <th className="p-1 border-r border-gray-100 bg-[#F2F2F2]">
              Series
            </th>
            <th className="p-1 border-r border-gray-100 bg-[#F2F2F2]">
              Number
            </th>

            {/* Mother Group */}
            <th className="p-1 border-r border-gray-200 bg-[#C5E0B4]/60">
              Nickname
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#C5E0B4]/60">
              Reg Code
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#C5E0B4]/60">
              ID UA
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#C5E0B4]/60">
              ID ABG
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#C5E0B4]/60">
              ID по ФХ
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#C5E0B4]/60">
              ID Chip
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#C5E0B4]/60">
              ID Int
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#C5E0B4]/60">
              Brand
            </th>

            {/* Father Group */}
            <th className="p-1 border-r border-gray-200 bg-[#F8CBAD]/60">
              Nickname
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#F8CBAD]/60">
              Reg Code
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#F8CBAD]/60">
              ID UA
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#F8CBAD]/60">
              ID ABG
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#F8CBAD]/60">
              ID по ФХ
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#F8CBAD]/60">
              ID Chip
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#F8CBAD]/60">
              ID Int
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#F8CBAD]/60">
              Brand
            </th>

            {/* Cert Group */}
            <th className="p-1 border-r border-gray-200 bg-[#B4E0E0]/60">
              Type
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0E0]/60">
              Score
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0E0]/60">
              Withers
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0E0]/60">
              Sacrum
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0E0]/60">
              Chest
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0E0]/60">
              Length
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0E0]/60">
              Class
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0E0]/60">
              Category
            </th>

            {/* Productivity Group */}
            <th className="p-1 border-r border-gray-200 bg-[#B4E0B4]/60">
              Actor
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0B4]/60">
              Lact No.
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0B4]/60">
              Days
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0B4]/60">
              Milk (kg)
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0B4]/60">
              Fat (%)
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0B4]/60">
              Protein (%)
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0B4]/60">
              Avg Daily
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#B4E0B4]/60">
              Graph
            </th>

            {/* Meta Group */}
            <th className="p-1 border-r border-gray-200 bg-[#F2F2F2]">
              Entry Date
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#F2F2F2]">
              Source
            </th>
            <th className="p-1 min-w-[80px] bg-[#4D2C1A] text-white border-l border-white/20">
              {t.goats.status}
            </th>
            <th className="p-1 border-r border-gray-200 bg-[#F2F2F2]">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {goats.map((g, idx) => (
            <tr
              key={idx}
              className="divide-x divide-gray-200 hover:bg-green-50/40 text-[8px] font-bold text-gray-800 h-8"
            >
              <td className="p-1 sticky left-0 bg-white z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)] whitespace-nowrap">
                <Link
                  href={`/goats/${g.id}`}
                  className="hover:text-blue-600 underline text-[#491907]"
                >
                  {g.name}
                </Link>
              </td>
              <td className="p-1 text-center font-mono">
                {g.breed_alias || g.breed_name}
              </td>
              <td className="p-1 text-center">
                {g.sex === 1 ? "Buck" : "Doe"}
              </td>
              <td className="p-1 text-center">{g.is_abg ? "Yes" : "No"}</td>
              <td className="p-1 truncate max-w-[150px]">
                {g.farm_name || "-"}
              </td>
              <td className="p-1 truncate max-w-[150px]">{g.manuf || "-"}</td>
              <td className="p-1 truncate max-w-[150px]">{g.owner || "-"}</td>
              <td className="p-1 text-center whitespace-nowrap font-mono">
                {g.date_born ? new Date(g.date_born).toLocaleDateString() : "-"}
              </td>
              <td className="p-1 text-center font-mono">
                {g.born_weight || "-"}
              </td>
              <td className="p-1 text-center font-mono">{g.born_qty || "-"}</td>
              <td className="p-1 text-center">{g.horns_type || "-"}</td>
              <td className="p-1 text-center">{g.have_gen || "-"}</td>
              <td className="p-1 text-center">{g.gen_mat || "-"}</td>
              <td className="p-1 text-center text-red-700 font-black">
                {g.id_stoodbook || "-"}
              </td>
              <td className="p-1 text-center font-mono">{g.code_ua || "-"}</td>
              <td className="p-1 text-center font-mono">{g.code_abg || "-"}</td>
              <td className="p-1 text-center font-mono">
                {g.code_farm || "-"}
              </td>
              <td className="p-1 text-center font-mono">
                {g.code_chip || "-"}
              </td>
              <td className="p-1 text-center font-mono">{g.code_int || "-"}</td>
              <td className="p-1 text-center">{g.code_brand || "-"}</td>

              {/* Certificate fields */}
              <td className="p-1 text-center bg-[#F2F2F2]/50">
                {g.cert_serial || "-"}
              </td>
              <td className="p-1 text-center bg-[#F2F2F2]/50">
                {g.cert_no || "-"}
              </td>

              {/* Mother fields */}
              <td className="p-1 text-blue-600 truncate max-w-[120px] bg-[#C5E0B4]/10">
                {g.m_id ? (
                  <Link href={`/goats/${g.m_id}`} className="hover:underline">
                    {g.m_name}
                  </Link>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-1 text-center bg-[#C5E0B4]/10 font-mono">
                {g.m_id || "-"}
              </td>
              <td className="p-1 text-center bg-[#C5E0B4]/10 font-mono">
                {g.m_code_ua || "-"}
              </td>
              <td className="p-1 text-center bg-[#C5E0B4]/10 font-mono">
                {g.m_code_abg || "-"}
              </td>
              <td className="p-1 text-center bg-[#C5E0B4]/10 font-mono">
                {g.m_code_farm || "-"}
              </td>
              <td className="p-1 text-center bg-[#C5E0B4]/10 font-mono">
                {g.m_code_chip || "-"}
              </td>
              <td className="p-1 text-center bg-[#C5E0B4]/10 font-mono">
                {g.m_code_int || "-"}
              </td>
              <td className="p-1 text-center bg-[#C5E0B4]/10">
                {g.m_code_brand || "-"}
              </td>

              {/* Father fields */}
              <td className="p-1 text-blue-600 truncate max-w-[120px] bg-[#F8CBAD]/10">
                {g.f_id ? (
                  <Link href={`/goats/${g.f_id}`} className="hover:underline">
                    {g.f_name}
                  </Link>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-1 text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_id || "-"}
              </td>
              <td className="p-1 text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_code_ua || "-"}
              </td>
              <td className="p-1 text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_code_abg || "-"}
              </td>
              <td className="p-1 text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_code_farm || "-"}
              </td>
              <td className="p-1 text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_code_chip || "-"}
              </td>
              <td className="p-1 text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_code_int || "-"}
              </td>
              <td className="p-1 text-center bg-[#F8CBAD]/10 font-mono">
                {g.f_code_brand || "-"}
              </td>

              {/* Certification fields */}
              <td className="p-1 text-center bg-[#B4E0E0]/10">
                {g.test_type
                  ? g.test_type === 1
                    ? "Classical"
                    : "Young"
                  : "-"}
              </td>
              <td className="p-1 text-center text-red-600 font-extrabold bg-[#B4E0B4]/5">
                {g.score_total || "-"}
              </td>
              <td className="p-1 text-center bg-[#B4E0E0]/5 font-mono">
                {g.par_1 || "-"}
              </td>
              <td className="p-1 text-center bg-[#B4E0E0]/5 font-mono">
                {g.par_2 || "-"}
              </td>
              <td className="p-1 text-center bg-[#B4E0E0]/5 font-mono">
                {g.par_3 || "-"}
              </td>
              <td className="p-1 text-center bg-[#B4E0E0]/5 font-mono">
                {g.par_4 || "-"}
              </td>
              <td className="p-1 text-center bg-[#B4E0E0]/5">
                {g.cert_class || "-"}
              </td>
              <td className="p-1 text-center bg-[#B4E0E0]/5">
                {g.category || "-"}
              </td>

              {/* Productivity fields */}
              <td className="p-1 text-center bg-[#B4E0B4]/10">
                {g.viewer || "-"}
              </td>
              <td className="p-1 text-center bg-[#B4E0B4]/10 font-mono">
                {g.lact_no || "-"}
              </td>
              <td className="p-1 text-center bg-[#B4E0B4]/10 font-mono">
                {g.lact_days || "-"}
              </td>
              <td className="p-1 text-center text-red-700 font-black bg-[#B4E0B4]/10 font-mono">
                {g.milk || "-"}
              </td>
              <td className="p-1 text-center bg-[#B4E0B4]/10 font-mono">
                {g.fat || "-"}
              </td>
              <td className="p-1 text-center bg-[#B4E0B4]/10 font-mono">
                {g.protein || "-"}
              </td>
              <td className="p-1 text-center bg-[#B4E0B4]/10 font-mono">
                {g.milk_day || "-"}
              </td>
              <td className="p-1 text-center bg-[#B4E0B4]/10">
                {g.have_graph ? "Yes" : "No"}
              </td>

              {/* Meta fields */}
              <td className="p-1 text-center text-gray-500 font-mono">
                {g.time_added
                  ? new Date(g.time_added).toLocaleDateString()
                  : "-"}
              </td>
              <td className="p-1 truncate max-w-[150px] italic">
                {g.source || "-"}
              </td>
              <td className="p-1 min-w-[80px] text-center bg-[#4D2C1A] text-white border-l border-[#4D2C1A]">
                {g.status === 1 ? "Live" : g.status === 2 ? "Dead" : "-"}
              </td>
              <td className="p-1 min-w-[250px] italic text-[7px] truncate max-w-[300px] border-l border-gray-200">
                {g.special || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
