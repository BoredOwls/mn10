import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Item, ItemState } from "../types";
import { ITEMS, USERS, VIEWER } from "../data/mock";

const SESSION_KEY = "parliament.session";

type Store = {
  authed: boolean;
  viewer: string;
  items: Item[];
  login: () => void;
  logout: () => void;
  addComment: (itemId: string, body: string) => void;
  setItemState: (itemId: string, state: ItemState) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(
    () => localStorage.getItem(SESSION_KEY) !== null,
  );
  const [items, setItems] = useState<Item[]>(ITEMS);

  const login = useCallback(() => {
    localStorage.setItem(SESSION_KEY, VIEWER);
    setAuthed(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }, []);

  const addComment = useCallback((itemId: string, body: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              comments: [
                ...it.comments,
                {
                  id: `local-${Date.now()}`,
                  author: VIEWER,
                  body,
                  at: Date.now(),
                },
              ],
            }
          : it,
      ),
    );
  }, []);

  const setItemState = useCallback((itemId: string, state: ItemState) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, state } : it)),
    );
  }, []);

  const value = useMemo(
    () => ({
      authed,
      viewer: VIEWER,
      items,
      login,
      logout,
      addComment,
      setItemState,
    }),
    [authed, items, login, logout, addComment, setItemState],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function userByLogin(login: string) {
  return USERS.find((u) => u.login === login) ?? { login, name: login, hue: 0 };
}
