'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Business, BrandDNA, Platform, ChatMessage, SavedContent, ContentVariant, ContentBrief, Campaign, CalendarEvent, PromptTemplate, ViewType } from '@/types';
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
  // Legacy chat (kept for backward compat during migration)
  addChatMessage: (businessId: string, platform: Platform, message: ChatMessage) => void;
  clearChat: (businessId: string, platform: Platform) => void;
  // Content Library (legacy)
  savedContent: SavedContent[];
  saveContent: (content: Omit<SavedContent, 'id' | 'createdAt'>) => void;
  deleteContent: (id: string) => void;
  toggleStarContent: (id: string) => void;
  updateContentTags: (id: string, tags: string[]) => void;
  // Content Variants (new)
  contentVariants: ContentVariant[];
  addContentVariant: (variant: Omit<ContentVariant, 'id' | 'createdAt' | 'updatedAt'>) => ContentVariant;
  updateContentVariant: (id: string, updates: Partial<ContentVariant>) => void;
  deleteContentVariant: (id: string) => void;
  toggleStarVariant: (id: string) => void;
  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  // Calendar Events
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  // Custom Templates
  customTemplates: PromptTemplate[];
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'isBuiltIn'>) => void;
  deleteTemplate: (id: string) => void;
  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const BusinessContext = createContext<BusinessContextType | null>(null);

const STORAGE_KEY = 'content-gen1-businesses';
const SELECTED_KEY = 'content-gen1-selected';
const CONTENT_KEY = 'content-gen1-saved-content';
const TEMPLATES_KEY = 'content-gen1-custom-templates';
const VARIANTS_KEY = 'content-gen1-content-variants';
const CAMPAIGNS_KEY = 'content-gen1-campaigns';
const CALENDAR_KEY = 'content-gen1-calendar';

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [customTemplates, setCustomTemplates] = useState<PromptTemplate[]>([]);
  const [contentVariants, setContentVariants] = useState<ContentVariant[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
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
    const storedVariants = localStorage.getItem(VARIANTS_KEY);
    if (storedVariants) {
      try { setContentVariants(JSON.parse(storedVariants)); } catch { /* ignore */ }
    }
    const storedCampaigns = localStorage.getItem(CAMPAIGNS_KEY);
    if (storedCampaigns) {
      try { setCampaigns(JSON.parse(storedCampaigns)); } catch { /* ignore */ }
    }
    const storedCalendar = localStorage.getItem(CALENDAR_KEY);
    if (storedCalendar) {
      try { setCalendarEvents(JSON.parse(storedCalendar)); } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage
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

  useEffect(() => {
    if (loaded) localStorage.setItem(VARIANTS_KEY, JSON.stringify(contentVariants));
  }, [contentVariants, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  }, [campaigns, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem(CALENDAR_KEY, JSON.stringify(calendarEvents));
  }, [calendarEvents, loaded]);

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId) || null;

  // Business CRUD
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

  // Legacy chat methods
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

  // Legacy Content Library
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

  // Content Variants CRUD
  const addContentVariant = useCallback((variant: Omit<ContentVariant, 'id' | 'createdAt' | 'updatedAt'>): ContentVariant => {
    const now = Date.now();
    const newVariant: ContentVariant = { ...variant, id: uuidv4(), createdAt: now, updatedAt: now };
    setContentVariants(prev => [newVariant, ...prev]);
    return newVariant;
  }, []);

  const updateContentVariant = useCallback((id: string, updates: Partial<ContentVariant>) => {
    setContentVariants(prev => prev.map(v => v.id === id ? { ...v, ...updates, updatedAt: Date.now() } : v));
  }, []);

  const deleteContentVariant = useCallback((id: string) => {
    setContentVariants(prev => prev.filter(v => v.id !== id));
    // Also remove any calendar events referencing this variant
    setCalendarEvents(prev => prev.filter(e => e.contentVariantId !== id));
  }, []);

  const toggleStarVariant = useCallback((id: string) => {
    setContentVariants(prev => prev.map(v => v.id === id ? { ...v, starred: !v.starred, updatedAt: Date.now() } : v));
  }, []);

  // Campaigns CRUD
  const addCampaign = useCallback((campaign: Omit<Campaign, 'id' | 'createdAt'>): Campaign => {
    const newCampaign: Campaign = { ...campaign, id: uuidv4(), createdAt: Date.now() };
    setCampaigns(prev => [...prev, newCampaign]);
    return newCampaign;
  }, []);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  }, []);

  // Calendar Events CRUD
  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const newEvent: CalendarEvent = { ...event, id: uuidv4() };
    setCalendarEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateCalendarEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteCalendarEvent = useCallback((id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
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
      contentVariants,
      addContentVariant,
      updateContentVariant,
      deleteContentVariant,
      toggleStarVariant,
      campaigns,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      calendarEvents,
      addCalendarEvent,
      updateCalendarEvent,
      deleteCalendarEvent,
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
