const STORAGE_KEY = "sidebar-folder-state";

interface FolderState {
  openFolders: string[];
  timestamp: number;
}

/**
 * Load state.
 */
const loadState = (): Set<string> => {
  if (typeof window === "undefined") return new Set();

  const savedData = sessionStorage.getItem(STORAGE_KEY);
  if (savedData) {
    const state: FolderState = JSON.parse(savedData);
    // don't restore if data is too old (more than 1 hour)
    if (Date.now() - state.timestamp < 60 * 60 * 1000)
      return new Set(state.openFolders);
  }

  return new Set();
};

/**
 * Save state.
 */
const saveState = (openFolders: Set<string>) => {
  const state: FolderState = {
    openFolders: Array.from(openFolders),
    timestamp: Date.now(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// Check if a folder was previously open
export const getPersistedFolderState = (
  folderId: string,
  fallback: boolean,
): boolean => {
  const openFolders = loadState();

  // use persisted state if found
  if (openFolders.size > 0 || sessionStorage.getItem(STORAGE_KEY))
    return openFolders.has(folderId);

  return fallback;
};

/**
 * Toggle folder state and persist.
 * @param folderId folder ID
 * @param isOpen whether the folder is open
 */
export const toggleFolderState = (folderId: string, isOpen: boolean) => {
  const openFolders = loadState();

  if (isOpen) openFolders.add(folderId);
  else openFolders.delete(folderId);

  saveState(openFolders);
};
