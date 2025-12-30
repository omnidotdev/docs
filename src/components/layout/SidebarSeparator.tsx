import getSectionDescription from "@/lib/getSectionDescription";

interface SidebarSeparatorProps {
  item: any;
}

const SidebarSeparator = ({ item }: SidebarSeparatorProps) => {
  return (
    <>
      <hr className="my-6" />
      <div className="mb-2 inline-flex items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0">
        <p>
          <span className="flex ps-[calc(2*var(--spacing))] font-bold">
            {item.icon}
            {item.name}
          </span>
          <span className="my-2 flex ps-[calc(2*var(--spacing))] text-fd-muted-foreground italic">
            {getSectionDescription(
              item.name.props.dangerouslySetInnerHTML.__html,
            )}
          </span>
        </p>
      </div>
    </>
  );
};

export default SidebarSeparator;
