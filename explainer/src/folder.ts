import { createContext, useContext } from "react";

/** The folder slug a page renders under; ids, glossary keys and source keys are namespaced by it. */
export const FolderSlug = createContext("");

export function useFolderKey(): (key: string) => string {
  const slug = useContext(FolderSlug);
  return (key) => (slug ? `${slug}-${key}` : key);
}
