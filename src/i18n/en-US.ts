// English (en-US) - Source of Truth
export const enUS = {
  common: {
    copy: 'Copy',
    paste: 'Paste',
    clear: 'Clear',
    reset: 'Reset',
    share: 'Share',
    error: 'Error',
    loading: 'Loading',
    download: 'Download',
    upload: 'Upload',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    apply: 'Apply',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
  },
  sidebar: {
    appName: "Yowu's DevTools",
    goToYowuDev: 'Go to yowu.dev',
    favorites: 'Favorites',
    recentTools: 'Recent',
    allTools: 'All Tools',
    noToolsLoaded: 'No tools loaded',
    moreComingSoon: 'More coming soon...',
    removeFromFavorites: 'Remove from favorites',
    addToFavorites: 'Add to favorites',
    lightMode: 'Light Mode',
    systemMode: 'System Mode',
    darkMode: 'Dark Mode',
  },
  tool: {
    // Tool-specific translations will be added here
    // Example structure:
    // json: {
    //   title: 'JSON Viewer',
    //   description: 'Pretty print and traverse JSON',
    //   placeholder: 'Paste JSON here...',
    // },
  },
  meta: {
    // SEO meta translations will be added here
    // Example structure:
    // json: {
    //   title: 'JSON Viewer - tools.yowu.dev',
    //   description: 'Free online JSON viewer, formatter, and validator...',
    // },
  },
} as const;

export type I18nResource = typeof enUS;

