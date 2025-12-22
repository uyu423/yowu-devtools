import { ImageIcon } from 'lucide-react';
import { DEFAULT_SETTINGS, type IconConverterSettings } from './logic/constants';
import { IconConverterToolPage } from './ToolPage';
import type { ToolDefinition } from '../types';

export const iconConverterTool: ToolDefinition<IconConverterSettings> = {
  id: 'icon-converter',
  title: 'Icon Converter',
  description: 'Convert SVG/images to ICO, PNG, WebP, JPEG with multi-size presets',
  path: '/icon-converter',
  icon: ImageIcon,
  defaultState: DEFAULT_SETTINGS,
  Component: IconConverterToolPage,
};

