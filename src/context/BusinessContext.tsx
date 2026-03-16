'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Business, BrandDNA, Platform, ChatMessage } from '@/types';
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
}

const BusinessContext = createContext<BusinessContextType | null>(null);

const STORAGE_KEY = 'content-gen1-businesses';
const SELECTED_KEY = 'content-gen1-selected';

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBusinesses(JSON.parse(stored));
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
        'youtube-shorts': [],
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
