import { useState, type ReactNode } from "react";
import { StoreContext } from "./store-context";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  return <StoreContext.Provider value={{ search, setSearch }}>{children}</StoreContext.Provider>;
}