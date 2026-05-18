"use client";

import { deleteGoatAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface GoatDeleteButtonProps {
  goatId: number | string;
  confirmMsg?: string;
  titleText?: string;
}

export default function GoatDeleteButton({
  goatId,
  confirmMsg = "Are you sure you want to delete this goat?",
  titleText = "Delete",
}: GoatDeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(confirmMsg)) {
      const res = await deleteGoatAction(goatId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to delete goat");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center justify-center w-8 h-8 bg-[#491907] text-white rounded-sm hover:bg-black transition-all shadow-sm cursor-pointer"
      title={titleText}
    >
      <Trash2 size={14} />
    </button>
  );
}
