'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Business, BrandDNA, Platform, ChatMessage, ContentPiece } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface BusinessContextType {
  businesses: Business[];
  selectedBusinessId: string | null;
  selectedBusiness: Business | null;
  addBusiness: (name: string, description: string) => Business;
  updateBusiness: (id: string, updates: Partial<Business>) => void;
  deleteBusiness: (id: string) => void;
  selectBusiness: (id: string | null) => void;
  updateBrandDNA: (businessId: string, brandDNA: BrandDNA) => void;
  addChatMessage: (businessId: string, platform: Platform, message: ChatMessage) => void;
  clearChat: (businessId: string, platform: Platform) => void;
  contentPieces: ContentPiece[];
  addContentPiece: (piece: ContentPiece) => void;
  updateContentPiece: (id: string, updates: Partial<ContentPiece>) => void;
  deleteContentPiece: (id: string) => void;
}

const BusinessContext = createContext<BusinessContextType | null>(null);

const STORAGE_KEY = 'content-gen1-businesses';
const SELECTED_KEY = 'content-gen1-selected';
const CONTENT_KEY = 'content-gen1-content-pieces';

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [contentPieces, setContentPieces] = useState<ContentPiece[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBusinesses(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    const storedContent = localStorage.getItem(CONTENT_KEY);
    if (storedContent) {
      try {
        setContentPieces(JSON.parse(storedContent));
      } catch { /* ignore */ }
    }
    const selectedId = localStorage.getItem(SELECTED_KEY);
    if (selectedId) setSelectedBusinessId(selectedId);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
    }
  }, [businesses, loaded]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(CONTENT_KEY, JSON.stringify(contentPieces));
    }
  }, [contentPieces, loaded]);

  useEffect(() => {
    if (loaded) {
      if (selectedBusinessId) {
        localStorage.setItem(SELECTED_KEY, selectedBusinessId);
      } else {
        localStorage.removeItem(SELECTED_KEY);
      }
    }
  }, [selectedBusinessId, loaded]);

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId) || null;

  const addBusiness = useCallback((name: string, description: string): Business => {
    const newBusiness: Business = {
      id: uuidv4(),
      name,
      description,
      brandDNA: null,
      chats: {
        instagram: [],
        twitter: [],
        linkedin: [],
        tiktok: [],
      },
      createdAt: Date.now(),
    };
    setBusinesses(prev => [...prev, newBusiness]);
    setSelectedBusinessId(newBusiness.id);
    return newBusiness;
  }, []);

  const updateBusiness = useCallback((id: string, updates: Partial<Business>) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const deleteBusiness = useCallback((id: string) => {
    setBusinesses(prev => prev.filter(b => b.id !== id));
    setSelectedBusinessId(prev => prev === id ? null : prev);
  }, []);

  const selectBusiness = useCallback((id: string | null) => {
    setSelectedBusinessId(id);
  }, []);

  const updateBrandDNA = useCallback((businessId: string, brandDNA: BrandDNA) => {
    setBusinesses(prev => prev.map(b => b.id === businessId ? { ...b, brandDNA } : b));
  }, []);

  const addChatMessage = useCallback((businessId: string, platform: Platform, message: ChatMessage) => {
    setBusinesses(prev => prev.map(b => {
      if (b.id !== businessId) return b;
      return {
        ...b,
        chats: {
          ...b.chats,
          [platform]: [...b.chats[platform], message],
        },
      };
    }));
  }, []);

  const clearChat = useCallback((businessId: string, platform: Platform) => {
    setBusinesses(prev => prev.map(b => {
      if (b.id !== businessId) return b;
      return {
        ...b,
        chats: {
          ...b.chats,
          [platform]: [],
        },
      };
    }));
  }, []);

  const addContentPiece = useCallback((piece: ContentPiece) => {
    setContentPieces(prev => [piece, ...prev]);
  }, []);

  const updateContentPiece = useCallback((id: string, updates: Partial<ContentPiece>) => {
    setContentPieces(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteContentPiece = useCallback((id: string) => {
    setContentPieces(prev => prev.filter(p => p.id !== id));
  }, []);

  if (!loaded) return null;

  return (
    <BusinessContext.Provider value={{
      businesses,
      selectedBusinessId,
      selectedBusiness,
      addBusiness,
      updateBusiness,
      deleteBusiness,
      selectBusiness,
      updateBrandDNA,
      addChatMessage,
      clearChat,
      contentPieces,
      addContentPiece,
      updateContentPiece,
      deleteContentPiece,
    }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusinessContext must be used within BusinessProvider');
  return ctx;
}
