const STORAGE_KEY_PREFIX = 'yowu-devtools:';

export const STORAGE_KEYS = {
  common: {
    locale: `${STORAGE_KEY_PREFIX}common:locale`,
    theme: `${STORAGE_KEY_PREFIX}common:theme`,
    sidebarCollapsed: `${STORAGE_KEY_PREFIX}common:sidebar-collapsed`,
    toolSort: `${STORAGE_KEY_PREFIX}common:tool-sort`,
    favorites: `${STORAGE_KEY_PREFIX}common:favorites`,
    recentTools: `${STORAGE_KEY_PREFIX}common:recent-tools`,
    pwaUpdateDismissed: `${STORAGE_KEY_PREFIX}common:pwa:update-dismissed-until`,
    pwaInstallDismissed: `${STORAGE_KEY_PREFIX}common:pwa:install-dismissed-until`,
  },
  share: {
    extensionGrantedOrigins: `${STORAGE_KEY_PREFIX}share:extension:granted-origins`,
  },
  apiTester: {
    history: `${STORAGE_KEY_PREFIX}api-tester:history`,
    favorites: `${STORAGE_KEY_PREFIX}api-tester:favorites`,
    corsAllowlist: `${STORAGE_KEY_PREFIX}api-tester:cors-allowlist`,
    requestResponseSplit: `${STORAGE_KEY_PREFIX}api-tester:ui:request-response-split`,
  },
  apiDiff: {
    history: `${STORAGE_KEY_PREFIX}api-diff:history`,
    diffTableHeight: `${STORAGE_KEY_PREFIX}api-diff:ui:diff-table-height`,
    domainPresets: `${STORAGE_KEY_PREFIX}api-diff:domain-presets`,
  },
  apiBurstTest: {
    warningResponsibleDismissed: `${STORAGE_KEY_PREFIX}api-burst-test:warning-responsible-dismissed`,
    warningLimitationsDismissed: `${STORAGE_KEY_PREFIX}api-burst-test:warning-limitations-dismissed`,
  },
  imageStudio: {
    pipelinePresets: `${STORAGE_KEY_PREFIX}image-studio:pipeline-presets`,
  },
  videoStudio: {
    pipelinePresets: `${STORAGE_KEY_PREFIX}video-studio:pipeline-presets`,
  },
};

export const SESSION_KEYS = {
  apiTester: {
    fromCurl: `${STORAGE_KEY_PREFIX}api-tester:session:from-curl`,
  },
};

export const buildToolStateKey = (toolId: string) =>
  `${STORAGE_KEY_PREFIX}${toolId}:state`;

export const buildUiKey = (suffix: string) =>
  `${STORAGE_KEY_PREFIX}${suffix}`;
