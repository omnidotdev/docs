import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface SidebarFolderProps {
  item: any;
  children: React.ReactNode;
}

const SidebarFolder = ({ item, children }: SidebarFolderProps) => {
  const { pathname } = useLocation();

  // Folder URL can be on item.url or item.index.url (Fumadocs structure)
  const folderUrl = item.url || item.index?.url;

  // Check if this folder or any of its children is active
  const isActive = folderUrl === pathname;
  const containsActive =
    item.children?.some(
      (child: any) =>
        child.url === pathname ||
        child.index?.url === pathname ||
        child.children?.some(
          (gc: any) => gc.url === pathname || gc.index?.url === pathname,
        ),
    ) ?? false;

  const [open, setOpen] = useState(isActive || containsActive);

  // Auto-expand when navigating to a child page
  useEffect(() => {
    if (containsActive && !open) {
      setOpen(true);
    }
  }, [containsActive, open]);

  // If folder has a URL, render as a link with separate toggle button
  if (folderUrl) {
    return (
      <div>
        <div
          className={cn(
            "group flex items-center rounded-lg transition-colors hover:bg-fd-accent/50",
            isActive && "bg-fd-primary/10",
          )}
        >
          <Link
            to={folderUrl}
            className={cn(
              "flex flex-1 cursor-pointer items-center gap-2 p-2 text-start text-fd-muted-foreground transition-colors group-hover:text-fd-accent-foreground/80",
              isActive && "text-fd-primary",
            )}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
              "p-2 text-fd-muted-foreground transition-colors group-hover:text-fd-accent-foreground/80",
              isActive && "text-fd-primary",
            )}
            aria-expanded={open}
          >
            <motion.div
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div className="ml-6 space-y-1 pt-1">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Folder without URL - just toggle to expand/collapse
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg p-2 text-start text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80"
        aria-expanded={open}
      >
        {item.icon}
        <span className="flex-1 font-medium">{item.name}</span>
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div className="ml-6 space-y-1 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SidebarFolder;
