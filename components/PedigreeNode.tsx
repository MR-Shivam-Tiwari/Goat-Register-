import Link from "next/link";

interface PedigreeNodeProps {
  node: any;
  prefix: string;
  color: string;
  border?: boolean;
  isGuest?: boolean;
  t: any;
}

export default function PedigreeNode({ node, prefix, color, border, isGuest = false, t }: PedigreeNodeProps) {
  if (!node) {
    return (
      <div className={`flex-1 ${color} flex items-center justify-center p-2 text-[10px] font-black italic opacity-20 uppercase tracking-widest`}>
        {t.catalog.empty}
      </div>
    );
  }

  return (
    <div
      className={`flex-1 min-h-[32px] p-1.5 flex items-center gap-1 leading-tight ${color} ${border ? "border-b border-gray-400" : ""}`}
    >
      <span className={prefix === "F:" || prefix === "О:" || prefix === "O:" ? "text-blue-600" : "text-pink-600"}>
        {prefix}
      </span>
      {isGuest ? (
        <span className="font-bold text-[#491907] truncate max-w-[110px]">
          {node.name}
        </span>
      ) : (
        <Link
          href={`/goats/${node.id}`}
          className="font-bold text-[#491907] hover:underline truncate max-w-[110px]"
        >
          {node.name}
        </Link>
      )}
      <span className="text-[9px] font-black opacity-30 ml-auto whitespace-nowrap">
        {node.reg_code || `ID:${node.id}`}
      </span>
    </div>
  );
}
