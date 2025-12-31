import React from "react";

import { REALMS } from "./sections";

import type { Folder, Node, Root, Separator } from "fumadocs-core/page-tree";

export interface VirtualFolder extends Folder {
  virtualSection: boolean;
  originalSeparator: Separator;
  sectionId: string;
  /** Count of pages in this section (excluding index pages). */
  docCount: number;
}

/**
 * Recursively count page items in a node tree, excluding index pages.
 * @param nodes Nodes to count.
 * @returns Count of page items.
 */
const countPages = (nodes: Node[]): number => {
  let count = 0;

  for (const node of nodes) {
    if (node.type === "page") {
      count += 1;
    } else if (node.type === "folder") {
      // Count children recursively, but don't count the folder's index page
      count += countPages((node as Folder).children);
    }
  }

  return count;
};

/**
 * Extract section ID from section name.
 * @param name Section name.
 * @returns Section ID.
 */
const getSectionIdFromName = (name: any): string => {
  if (!name?.props?.dangerouslySetInnerHTML?.__html) return "unknown";
  const html = name.props.dangerouslySetInnerHTML.__html.toLowerCase();

  const realm = REALMS.find((r) => html.includes(r.id));

  return realm?.id ?? "unknown";
};

/**
 * Sort nodes alphabetically only for folders without meta.json.
 * @param nodes Nodes to sort.
 * @param respectOrder Whether to respect the order of the nodes.
 * @returns Sorted nodes.
 */
const sortNodes = (nodes: Node[], respectOrder = true): Node[] => {
  // Don't sort if we should respect ordering (for sections with meta.json)
  if (respectOrder) {
    return nodes;
  }

  const stripEmojisAndNonAlpha = (text: string): string => {
    // Remove emojis and keep only alphabetic characters and spaces
    return text
      .replace(
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
        "",
      )
      .replace(/[^a-zA-Z\s]/g, "")
      .trim();
  };

  return nodes.sort((a, b) => {
    const aName =
      typeof a.name === "string"
        ? a.name
        : (a.name as any)?.props?.dangerouslySetInnerHTML?.__html || "";
    const bName =
      typeof b.name === "string"
        ? b.name
        : (b.name as any)?.props?.dangerouslySetInnerHTML?.__html || "";

    const aSortName = stripEmojisAndNonAlpha(aName);
    const bSortName = stripEmojisAndNonAlpha(bName);

    return aSortName.localeCompare(bSortName, undefined, {
      sensitivity: "base",
    });
  });
};

/**
 * Transform page tree.
 * @param root Root node.
 * @returns Transformed page tree.
 */
const transformPageTree = (root: Root): Root => {
  // Create a virtual folder for a section
  const createVirtualFolder = (section: Node, items: Node[]): VirtualFolder => {
    const folderWithIndex = items.find(
      (item) => item.type === "folder" && item.index,
    ) as Folder | undefined;

    return {
      type: "folder",
      name: section.name,
      icon: section.icon,
      index: folderWithIndex?.index
        ? mapNode(folderWithIndex.index, true)
        : undefined,
      children: sortNodes(items, true).map((c) => mapNode(c, false)),
      virtualSection: true,
      originalSeparator: section as Separator,
      sectionId: getSectionIdFromName(section.name),
      // Subtract 1 for the introduction/index page
      docCount: Math.max(0, countPages(items) - 1),
    };
  };

  // Group items under separators to make sections collapsible
  const groupBySection = (children: Node[]): Node[] => {
    const result: Node[] = [];
    let currentSection: Node | null = null;
    let currentSectionItems: Node[] = [];

    for (const child of children) {
      if (child.type === "separator") {
        // If we have a previous section, create a virtual folder for it
        if (currentSection) {
          result.push(createVirtualFolder(currentSection, currentSectionItems));
        }

        // Start new section
        currentSection = child;
        currentSectionItems = [];
      } else {
        // Add item to current section
        if (currentSection) {
          currentSectionItems.push(child);
        } else {
          // No section yet, add directly
          result.push(mapNode(child, false));
        }
      }
    }

    // Handle the last section (include even if empty to show "coming soon" message)
    if (currentSection) {
      result.push(createVirtualFolder(currentSection, currentSectionItems));
    }

    return result;
  };

  // add lineage flag
  const mapNode = <T extends Node>(item: T, isChildOfFolder = false): T => {
    if (typeof item.icon === "string")
      item = {
        ...item,
        icon: React.createElement("span", {
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Fumadocs does this in their example
          dangerouslySetInnerHTML: {
            __html: item.icon,
          },
        }),
      } as T;

    if (item.type === "folder")
      return {
        ...item,
        // mark folder itself
        isChildOfFolder,
        index: item.index ? mapNode(item.index, true) : undefined,
        // mark all children of folder
        children: sortNodes((item as any).children, false).map((c: any) =>
          mapNode(c, true),
        ),
      } as T;

    // leaf/file
    return {
      ...item,
      isChildOfFolder,
    } as T;
  };

  return {
    ...root,
    // Transform children to group by sections
    children: groupBySection(root.children),
    fallback: root.fallback ? transformPageTree(root.fallback) : undefined,
  };
};

export default transformPageTree;
