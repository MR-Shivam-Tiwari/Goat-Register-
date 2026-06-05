import Link from "next/link";

interface PedigreeNodeProps {
  node: any;
  prefix: string;
  color: string;
  border?: boolean;
  isGuest?: boolean;
  t: any;
}

export default function PedigreeNode({
  node,
  prefix,
  color,
  border,
  isGuest = false,
  t,
}: PedigreeNodeProps) {
  const isHex = color && color.startsWith('#');
  const style = isHex ? { backgroundColor: color } : undefined;
  const colorClass = isHex ? '' : color;

  if (!node) {
    return (
      <div
        style={style}
        className={`flex-1 flex items-center justify-center p-2 text-[10px] font-black opacity-20 uppercase tracking-widest ${colorClass}`}
      >
        {t.catalog.empty}
      </div>
    );
  }

  return (
    <div
      style={style}
      className={`flex-1 min-h-[32px] p-1.5 flex items-center gap-1 leading-tight ${colorClass} ${border ? "border-b border-gray-400" : ""}`}
    >
      <span
        className={
          prefix === "F:" || prefix === "О:" || prefix === "O:"
            ? "text-blue-600 font-extrabold"
            : "text-pink-600 font-extrabold"
        }
      >
        {prefix}
      </span>
      {isGuest ? (
        <span className="font-bold text-[#491907] truncate">
          {node.name} ({node.is_abg ? "R" : "X"}
          {10000 + Number(node.id)})
        </span>
      ) : (
        <a
          href={`/goats/${node.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[#491907] hover:underline truncate"
        >
          {node.name} ({node.is_abg ? "R" : "X"}
          {10000 + Number(node.id)})
        </a>
      )}
    </div>
  );
}
