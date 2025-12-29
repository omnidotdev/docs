import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
          <motion.div
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ChevronRight className="h-4 w-4 text-fd-muted-foreground" />
          </motion.div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent forceMount asChild>
        <motion.div
          initial={false}
          animate={{
            height: open ? "auto" : 0,
            opacity: open ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            opacity: { duration: 0.2 },
          }}
          style={{ overflow: "hidden" }}
        >
          <motion.div
            className="ml-6 space-y-1 pt-1"
            animate={{
              y: open ? 0 : -8,
              opacity: open ? 1 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              delay: open ? 0.1 : 0,
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SidebarFolder;
