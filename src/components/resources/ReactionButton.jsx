import React, { useState } from "react";
import { Heart } from "lucide-react";

function ReactionButton({
  liked = false,
  count = 0,
  onToggle,
  disabled = false,
}) {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    if (disabled || isPending || typeof onToggle !== "function") {
      return;
    }

    try {
      setIsPending(true);
      await onToggle();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
        liked
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Heart size={16} className={liked ? "fill-current" : ""} />
      {isPending ? "Updating..." : liked ? "Liked" : "Like"}
      <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-bold">
        {count}
      </span>
    </button>
  );
}

export default ReactionButton;