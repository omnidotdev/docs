import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import LinkButton, { type Link } from "./LinkButton";

import type { ReactNode } from "react";

interface ProductOverviewAlert {
  /**
   * Title of the alert.
   */
  title: string;
  /**
   * Description text for the alert.
   */
  description: string;
  /**
   * Classes for styling the alert.
   */
  className?: string;
}

interface ProductOverviewTag {
  /**
   * Label text to display in the tag.
   */
  label: string;
  /**
   * Classes for styling the tag.
   */
  className?: string;
  /**
   * Icon or logo to display with the tag.
   */
  icon?: ReactNode;
}

interface ProductOverviewProps {
  /**
   * Array of links to display (website, repository, etc.).
   */
  links?: Link[];
  /**
   * Array of alerts to display (under construction, big idea, etc.).
   */
  alerts?: ProductOverviewAlert[];
  /**
   * Array of tags to display (technologies, categories, etc.).
   */
  tags?: ProductOverviewTag[];
}

// TODO improve styles

/**
 * Product overview.
 */
const ProductOverview: React.FC<ProductOverviewProps> = ({
  links = [],
  alerts = [],
  tags = [],
}) => (
  <div className="mb-8">
    {tags.length > 0 && (
      <div className="mb-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag.label} className={tag.className}>
            <div className="flex items-center gap-1">
              {tag.icon && <span>{tag.icon}</span>}

              {tag.label}
            </div>
          </Badge>
        ))}
      </div>
    )}

    {links.length > 0 && (
      <div className="flex gap-2">
        {links.map((link) => (
          <LinkButton key={link.label} link={link} />
        ))}
      </div>
    )}

    {alerts.length > 0 && (
      <div className="mt-4 flex flex-col gap-2">
        {alerts.map((alert) => (
          <Alert key={alert.title} className={cn(alert.className)}>
            <AlertTitle>{alert.title}</AlertTitle>

            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        ))}
      </div>
    )}
  </div>
);

export default ProductOverview;
