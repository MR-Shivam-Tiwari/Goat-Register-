import Link from "next/link";

interface PedigreeNodeProps {
  node: any;
  prefix: string;
  color: string;
  border?: boolean;
  isGuest?: boolean;
}

export default function PedigreeNode({ node, prefix, color, border, isGuest = false }: PedigreeNodeProps) {
  return (
    <div
      className={`flex-1 min-h-[32px] p-1.5 flex items-center gap-1 leading-tight ${color} ${border ? "border-b border-gray-400" : ""}`}
    >
      {node ? (
        <>
          <span className={prefix === "O:" ? "text-blue-600" : "text-pink-600"}>
            {prefix}
          </span>
          {isGuest ? (
            <span className="font-bold text-[#491907] truncate max-w-[110px]">
              {node.name}
            </span>
          ) : (
            <Link
              href={`/goats/${node.id}`}
              className="hover:underline truncate max-w-[110px]"
            >
              {node.name}
            </Link>
          )}
          <span className="opacity-50 text-[7px] font-bold">
            ({node.code_ua || node.id})
          </span>
        </>
      ) : (
        <span className="opacity-10">-</span>
      )}
    </div>
  );
}
