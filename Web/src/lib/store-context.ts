import { createContext, useContext } from "react";

export const StoreContext = createContext({ search: "", setSearch: (_value: string) => {} });
export const useStore = () => useContext(StoreContext);