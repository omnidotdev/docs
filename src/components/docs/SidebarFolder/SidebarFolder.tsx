import { ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface SidebarFolderProps {
  item: any;
  children: React.ReactNode;
}

const SidebarFolder = ({ item, children }: SidebarFolderProps) => {
  const [open, setOpen] = useState(false);

  const handleFolderToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!open);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          onClick={handleFolderToggle}
          className="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80"
          aria-expanded={open}
          aria-controls="collapsible-content"
        >
          {item.icon}
          <span className="font-medium">{item.name}</span>
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-300 ease-out",
              open && "rotate-90",
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="ml-6 space-y-1 pt-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SidebarFolder;
