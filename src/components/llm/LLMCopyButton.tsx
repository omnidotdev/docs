"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";

const cache = new Map<string, string>();

interface LLMCopyButtonProps {
  /** URL to fetch raw markdown content from. */
  markdownUrl: string;
}

/**
 * Button to copy page markdown content to clipboard for LLM use.
 */
function LLMCopyButton({ markdownUrl }: LLMCopyButtonProps) {
  const [isLoading, setLoading] = useState(false);
  const [isCopied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const cached = cache.get(markdownUrl);

    if (cached) {
      await navigator.clipboard.writeText(cached);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      return;
    }

    setLoading(true);

    try {
      const res = await fetch(markdownUrl);
      const content = await res.text();

      cache.set(markdownUrl, content);
      await navigator.clipboard.writeText(content);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setLoading(false);
    }
  }, [markdownUrl]);

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={isLoading}
      onClick={handleCopy}
      className="gap-2"
    >
      {isCopied ? (
        <Check className="size-3.5 text-fd-muted-foreground" />
      ) : (
        <Copy className="size-3.5 text-fd-muted-foreground" />
      )}
      Copy Markdown
    </Button>
  );
}

export default LLMCopyButton;
