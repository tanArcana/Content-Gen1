'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Business, BrandDNA, Platform, ChatMessage, SavedContent, PromptTemplate } from '@/types';
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
  // Content Library
  savedContent: SavedContent[];
  saveContent: (content: Omit<SavedContent, 'id' | 'createdAt'>) => void;
  deleteContent: (id: string) => void;
  toggleStarContent: (id: string) => void;
  updateContentTags: (id: string, tags: string[]) => void;
  // Custom Templates
  customTemplates: PromptTemplate[];
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'isBuiltIn'>) => void;
  deleteTemplate: (id: string) => void;
  // Navigation
  currentView: 'dashboard' | 'workspace' | 'library' | 'templates' | 'settings';
  setCurrentView: (view: 'dashboard' | 'workspace' | 'library' | 'templates' | 'settings') => void;
}

const BusinessContext = createContext<BusinessContextType | null>(null);

const STORAGE_KEY = 'content-gen1-businesses';
const SELECTED_KEY = 'content-gen1-selected';
const CONTENT_KEY = 'content-gen1-saved-content';
const TEMPLATES_KEY = 'content-gen1-custom-templates';

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [customTemplates, setCustomTemplates] = useState<PromptTemplate[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'workspace' | 'library' | 'templates' | 'settings'>('dashboard');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setBusinesses(JSON.parse(stored)); } catch { /* ignore */ }
    }
    const selectedId = localStorage.getItem(SELECTED_KEY);
    if (selectedId) setSelectedBusinessId(selectedId);

    const storedContent = localStorage.getItem(CONTENT_KEY);
    if (storedContent) {
      try { setSavedContent(JSON.parse(storedContent)); } catch { /* ignore */ }
    }
    const storedTemplates = localStorage.getItem(TEMPLATES_KEY);
    if (storedTemplates) {
      try { setCustomTemplates(JSON.parse(storedTemplates)); } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
  }, [businesses, loaded]);

  useEffect(() => {
    if (loaded) {
      if (selectedBusinessId) localStorage.setItem(SELECTED_KEY, selectedBusinessId);
      else localStorage.removeItem(SELECTED_KEY);
    }
  }, [selectedBusinessId, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem(CONTENT_KEY, JSON.stringify(savedContent));
  }, [savedContent, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem(TEMPLATES_KEY, JSON.stringify(customTemplates));
  }, [customTemplates, loaded]);

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId) || null;

  const addBusiness = useCallback((name: string, description: string): Business => {
    const newBusiness: Business = {
      id: uuidv4(),
      name,
      description,
      brandDNA: null,
      chats: { instagram: [], twitter: [], linkedin: [], tiktok: [] },
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
      return { ...b, chats: { ...b.chats, [platform]: [...b.chats[platform], message] } };
    }));
  }, []);

  const clearChat = useCallback((businessId: string, platform: Platform) => {
    setBusinesses(prev => prev.map(b => {
      if (b.id !== businessId) return b;
      return { ...b, chats: { ...b.chats, [platform]: [] } };
    }));
  }, []);

  // Content Library
  const saveContent = useCallback((content: Omit<SavedContent, 'id' | 'createdAt'>) => {
    const newContent: SavedContent = { ...content, id: uuidv4(), createdAt: Date.now() };
    setSavedContent(prev => [newContent, ...prev]);
  }, []);

  const deleteContent = useCallback((id: string) => {
    setSavedContent(prev => prev.filter(c => c.id !== id));
  }, []);

  const toggleStarContent = useCallback((id: string) => {
    setSavedContent(prev => prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c));
  }, []);

  const updateContentTags = useCallback((id: string, tags: string[]) => {
    setSavedContent(prev => prev.map(c => c.id === id ? { ...c, tags } : c));
  }, []);

  // Custom Templates
  const addTemplate = useCallback((template: Omit<PromptTemplate, 'id' | 'isBuiltIn'>) => {
    const newTemplate: PromptTemplate = { ...template, id: uuidv4(), isBuiltIn: false };
    setCustomTemplates(prev => [...prev, newTemplate]);
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== id));
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
      savedContent,
      saveContent,
      deleteContent,
      toggleStarContent,
      updateContentTags,
      customTemplates,
      addTemplate,
      deleteTemplate,
      currentView,
      setCurrentView,
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
