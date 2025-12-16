import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import getSectionDescription from "@/lib/getSectionDescription";
import getSectionGradient from "@/lib/getSectionGradient";
import { cn } from "@/lib/utils";

interface SidebarSectionProps {
  item: any;
  children: React.ReactNode;
  sectionId: string;
  isOpen: boolean;
  onToggle: (newOpen: boolean) => void;
  originalSeparator: any;
}

const SidebarSection = ({
  item,
  children,
  sectionId,
  isOpen,
  onToggle,
  originalSeparator,
}: SidebarSectionProps) => {
  const handleToggle = (newOpen: boolean) => {
    onToggle(newOpen);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
      <CollapsibleTrigger asChild>
        <div className="group w-full cursor-pointer text-left">
          <div
            className={cn(
              "inline-flex w-full items-center gap-2 rounded-md p-2 transition-all duration-300 [&_svg]:size-4 [&_svg]:shrink-0",
              getSectionGradient(sectionId, isOpen),
              !isOpen && getSectionGradient(sectionId, false, true),
            )}
          >
            <div className="flex-1">
              <span className="flex items-center gap-2 font-bold">
                {item.icon}
                {item.name}
              </span>

              <span className="mt-1 block text-fd-muted-foreground text-sm italic">
                {getSectionDescription(
                  originalSeparator?.name?.props?.dangerouslySetInnerHTML
                    ?.__html,
                )}
              </span>
            </div>

            <ChevronRight
              className={cn(
                "h-4 w-4 text-fd-muted-foreground transition-transform duration-300 ease-out",
                isOpen && "rotate-90",
              )}
            />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-1 pt-1">{children}</div>
      </CollapsibleContent>

      <hr className="my-2" />
    </Collapsible>
  );
};

export default SidebarSection;
