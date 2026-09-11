"use client";

import { useTransition } from "react";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadButton({ filePath, getUrlAction }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      aria-label="Download"
      onClick={() =>
        startTransition(async () => {
          const result = await getUrlAction(filePath);
          if (result?.url) window.open(result.url, "_blank", "noopener,noreferrer");
        })
      }
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="size-3.5" aria-hidden="true" />
      )}
    </Button>
  );
}
