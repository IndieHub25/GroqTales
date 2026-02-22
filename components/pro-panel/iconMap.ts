/**
 * Shared ICON_MAP — Single source of truth for mapping icon string identifiers
 * (from CATEGORY_CONFIG) to Lucide React components.
 * Used by ProPanel, CategorySection, DossierFormPanel, and MissionNavigator.
 */

import type { FC } from 'react';
import {
  BookOpen, Users, Globe, Theater, Lightbulb, Bot, Palette, Ruler, Settings,
} from 'lucide-react';

export const ICON_MAP: Record<string, FC<{ className?: string }>> = {
  'book-open': BookOpen,
  'users': Users,
  'globe': Globe,
  'theater': Theater,
  'lightbulb': Lightbulb,
  'bot': Bot,
  'palette': Palette,
  'ruler': Ruler,
  'settings': Settings,
};
