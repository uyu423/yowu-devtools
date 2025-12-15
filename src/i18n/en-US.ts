// English (en-US) - Source of Truth
export const enUS = {
  common: {
    copy: 'Copy',
    copied: 'Copied!',
    paste: 'Paste',
    clear: 'Clear',
    reset: 'Reset',
    resetTool: 'Reset Tool',
    share: 'Share',
    shareState: 'Share State',
    error: 'Error',
    loading: 'Loading',
    download: 'Download',
    upload: 'Upload',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    search: 'Search',
    searchTools: 'Search tools...',
    filter: 'Filter',
    apply: 'Apply',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    input: 'Input',
    output: 'Output',
    options: 'Options',
    result: 'Result',
    encode: 'Encode',
    decode: 'Decode',
    convert: 'Convert',
    format: 'Format',
    minify: 'Minify',
    validate: 'Validate',
    generate: 'Generate',
    swap: 'Swap',
    copyToClipboard: 'Copy to clipboard',
    pasteFromClipboard: 'Paste from clipboard',
    clearInput: 'Clear input',
    noResults: 'No results',
    typeToSearch: 'Type to search',
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
    language: 'Language',
    selectLanguage: 'Select language',
  },
  commandPalette: {
    placeholder: 'Search tools...',
    noResults: 'No results found',
    favorites: 'Favorites',
    recentTools: 'Recent',
    allTools: 'All Tools',
    pressEnterToSelect: 'Press Enter to select',
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

