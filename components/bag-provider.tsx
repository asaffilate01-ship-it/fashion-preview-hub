"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BagItem } from "@/lib/store";

const STORAGE_KEY = "kalethon-bag-v1";

type BagContextValue = {
  items: BagItem[];
  count: number;
  ready: boolean;
  addItem: (item: Omit<BagItem, "id" | "quantity">) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const BagContext = createContext<BagContextValue | null>(null);

function isBagItem(value: unknown): value is BagItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<BagItem>;
  return typeof item.id === "string" && typeof item.productId === "string" && typeof item.name === "string" && typeof item.quantity === "number";
}

export default function BagProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        if (Array.isArray(parsed)) setItems(parsed.filter(isBagItem).slice(0, 20));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<BagContextValue>(() => ({
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    ready,
    addItem: (next) => setItems((current) => {
      const match = current.find((item) => item.productId === next.productId && item.bodyColour === next.bodyColour && item.collarColour === next.collarColour && item.cuffColour === next.cuffColour && item.sleeve === next.sleeve && item.branding === next.branding && item.fit === next.fit && item.finish === next.finish && item.size === next.size);
      if (match) return current.map((item) => item.id === match.id ? { ...item, quantity: Math.min(5, item.quantity + 1) } : item);
      return [...current, { ...next, id: crypto.randomUUID(), quantity: 1 }];
    }),
    removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
    setQuantity: (id, quantity) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.min(5, quantity)) } : item)),
    clear: () => setItems([]),
  }), [items, ready]);

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const context = useContext(BagContext);
  if (!context) throw new Error("useBag must be used within BagProvider");
  return context;
}
