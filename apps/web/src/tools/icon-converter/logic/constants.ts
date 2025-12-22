// Icon Converter constants and types

export type OutputFormat = 'ico' | 'png' | 'webp' | 'jpeg';
export type Preset = 'windows_standard' | 'favicon_legacy' | 'custom';
export type FitMode = 'contain' | 'cover' | 'stretch';
export type BackgroundType = 'transparent' | 'solid';
export type IcoMode = 'modern_png' | 'compat';

// Type aliases for render functions
export type RenderFit = 'contain' | 'cover' | 'fill';
export type RenderBackground = 'transparent' | string; // CSS color string

export interface IconConverterSettings {
  // 출력 포맷
  outputFormat: OutputFormat;

  // 프리셋 및 사이즈
  preset: Preset;
  sizes: number[];

  // 렌더링 옵션
  fit: FitMode;
  padding: number; // 0~50 (%)
  background: {
    type: BackgroundType;
    color?: string; // #RRGGBB (solid일 때만)
  };

  // 품질 (WebP/JPEG만)
  quality: number; // 0~100

  // 멀티 사이즈 ZIP 출력
  exportZip: boolean;

  // ICO 모드
  icoMode: IcoMode;
}

// 프리셋 정의
export const PRESETS: Record<Preset, number[]> = {
  windows_standard: [16, 24, 32, 48, 64, 128, 256],
  favicon_legacy: [16, 32, 48],
  custom: [],
};

// 사이즈 범위
export const SIZE_RANGE = {
  min: 1,
  max: 256,
} as const;

// 사용 가능한 모든 사이즈 옵션
export const AVAILABLE_SIZES = [16, 24, 32, 48, 64, 96, 128, 256];

// 기본 설정
export const DEFAULT_SETTINGS: IconConverterSettings = {
  outputFormat: 'ico',
  preset: 'windows_standard',
  sizes: PRESETS.windows_standard,
  fit: 'contain',
  padding: 10,
  background: {
    type: 'transparent',
  },
  quality: 85,
  exportZip: false,
  icoMode: 'modern_png',
};

// 지원되는 입력 포맷
export const SUPPORTED_INPUT_FORMATS = [
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
] as const;

// 파일 확장자 매핑
export const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  ico: '.ico',
  png: '.png',
  webp: '.webp',
  jpeg: '.jpg',
};

// 최대 파일 크기 (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// 업스케일 경고 임계값
export const UPSCALE_WARNING_THRESHOLD = 2; // 2배 이상 업스케일 시 경고

// 큰 이미지 경고 임계값 (10MB)
export const LARGE_IMAGE_WARNING_SIZE = 10 * 1024 * 1024;

