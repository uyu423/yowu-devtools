// English (en-US) - Source of Truth
export const enUS = {
  common: {
    copy: 'Copy',
    copied: 'Copied!',
    copyFailed: 'Failed to copy',
    paste: 'Paste',
    clear: 'Clear',
    reset: 'Reset',
    share: 'Share',
    error: 'Error',
    loading: 'Loading',
    download: 'Download',
    downloaded: 'Downloaded!',
    downloadJson: 'Download JSON',
    upload: 'Upload',
    export: 'Export',
    import: 'Import',
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
    resetTool: 'Reset Tool',
    shareState: 'Share State',
    input: 'Input',
    output: 'Output',
    result: 'Result',
    options: 'Options',
    encode: 'Encode',
    decode: 'Decode',
    convert: 'Convert',
    format: 'Format',
    minify: 'Minify',
    validate: 'Validate',
    generate: 'Generate',
    parse: 'Parse',
    indent: 'Indent',
    spaces2: '2 spaces',
    spaces4: '4 spaces',
    copiedResult: 'Result copied.',
    copiedToClipboard: 'Copied to clipboard',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    processingLargeData: 'Processing large data...',
    noDataFound: 'No data found',
    invalidInput: 'Invalid input',
    // File operations
    fileDownloadSuccess: 'File downloaded successfully',
    fileDownloadFailed: 'Failed to download file',
    fileTooLarge: 'File is too large. Maximum size is {size}MB',
    fileLoadedSuccess: 'File "{name}" loaded successfully',
    fileReadFailed: 'Failed to read file',
    loadingFile: 'Loading file...',
    dropFileOrClick: 'Drop a file here or click to browse',
    accepted: 'Accepted',
    allTextFiles: 'All text files',
    max: 'Max',
    chooseFile: 'Choose File',
    // Share/clipboard
    shareLinkCopied: 'Share link copied.',
    unableToCopyShareLink: 'Unable to copy share link.',
    sharedSuccessfully: 'Shared successfully.',
    unableToShare: 'Unable to share.',
    sharedUrlInvalid: 'Shared URL is invalid. Restoring default state.',
    unableToCopy: 'Unable to copy to clipboard.',
  },
  shareModal: {
    title: 'Share {toolName}',
    sensitiveWarningTitle: 'Sensitive Data Warning',
    sensitiveWarningDescription:
      'This tool may contain sensitive information. Only share links with trusted parties. The shared data will be visible to anyone with the link.',
    includedInShareLink: 'Included in share link:',
    excludedUiOnly: 'Excluded (UI-only):',
    notShared: 'not shared',
    footerNote:
      'The share link will be copied to your clipboard. All processing happens in your browser - no data is sent to servers.',
    generateShareLink: 'Generate Share Link',
    copyLink: 'Copy Link',
    urlTooLongTitle: 'Share Link Too Long',
    urlTooLongDescription:
      'The share link is too long ({length} characters, max {maxLength}). Please reduce the input data to create a shareable link.',
  },
  pwa: {
    appReadyOffline: 'App is ready to work offline',
    youAreOffline: 'You are currently offline',
    newVersionAvailable: 'New version available',
    newVersionDescription:
      'A new version of the app is available. Update now to get the latest features.',
    updateNow: 'Update now',
    later: 'Later',
    installApp: 'Install App',
    installAppDescription:
      'Install this app on your device for quick access and offline use.',
    install: 'Install',
    notNow: 'Not now',
  },
  sidebar: {
    appName: "Yowu's DevTools",
    goToYowuDev: 'Go to yowu.dev',
    favorites: 'Favorites',
    recentTools: 'Recent',
    allTools: 'All Tools',
    noToolsLoaded: 'No tools loaded',
    moreComingSoon: 'More coming soon...',
    suggestFeature: 'Suggest a feature',
    removeFromFavorites: 'Remove from favorites',
    addToFavorites: 'Add to favorites',
    lightMode: 'Light Mode',
    systemMode: 'System Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
    selectLanguage: 'Select Language',
    // License info
    license: 'License',
    sourceCode: 'Source',
    noWarranty: 'No Warranty',
    // Sort options
    sortAlphabetical: 'Alphabetical',
    sortAdded: 'Added order',
    sortNewest: 'Newest first',
  },
  commandPalette: {
    searchTools: 'Search tools...',
    noResults: 'No results found',
    recentlyUsed: 'Recently used',
    favorites: 'Favorites',
    allTools: 'All Tools',
    pressEnterToSelect: 'Press Enter to select',
    typeToSearch: 'Type to search',
    navigate: 'Navigate',
    select: 'Select',
    close: 'Close',
    recent: 'Recent',
    addToFavorites: 'Add to favorites',
    removeFromFavorites: 'Remove from favorites',
  },
  homepage: {
    title: "Yowu's DevTools",
    heroDescription:
      'A privacy-first toolbox for developers who want to keep their data on their own machines. All processing happens in your browser—no servers, no trackers, no data collection. Open source and auditable, with 18+ tools including JSON viewer, API tester, cURL parser, regex tester, hash generator, and more. Fast, secure, and trustworthy.',
    whyItExists: 'Why it exists',
    privacyFirst: 'Privacy-first',
    privacyFirstDescription:
      'everything runs in your browser. No data sent to servers, no tracking, no analytics. Your sensitive data stays on your machine.',
    fastEfficient: 'Fast and efficient',
    fastEfficientDescription:
      'Command Palette for quick navigation, file drag & drop support, and Web Workers for handling large datasets without freezing your browser.',
    installablePwa: 'Installable PWA',
    installablePwaDescription:
      'works offline, installs as a standalone app, and automatically updates when new versions are available.',
    openAuditable: 'Open and auditable',
    openAuditableDescription:
      'every line of code is public. You can verify what each tool does and how it processes your data.',
    hostedOn:
      'Hosted on GitHub Pages as a static site. All processing happens in your browser.',
    viewOnGithub: 'View on GitHub',
    quickNavigation: 'Quick Navigation',
    quickNavigationDescription:
      'Press {cmdK} or {ctrlK} to open the Command Palette and quickly find any tool.',
    searchByName: 'Search tools by name or keywords',
    navigateWithArrows: 'Navigate with arrow keys',
    accessFavorites: 'Access favorites and recent tools',
    availableTools: 'Available Tools',
  },
  tool: {
    json: {
      title: 'JSON Pretty Viewer',
      description:
        'Format, validate, and navigate JSON with tree view and syntax highlighting.',
      inputTitle: 'Input JSON',
      inputPlaceholder: '{"key": "value"}',
      sortKeys: 'Sort keys',
      treeDepth: 'Tree Depth',
      expandAllLevels: 'Expand all levels',
      setToLevel: 'Set to level {n}',
      viewTree: 'Tree',
      viewPretty: 'Pretty',
      viewMinified: 'Minified',
      searchPlaceholder: 'Search...',
      treeView: 'Tree View',
      prettyJson: 'Pretty JSON',
      minifiedJson: 'Minified JSON',
      pasteJsonHint: 'Paste JSON on the left to preview the result.',
      processingLargeJson: 'Processing large JSON data...',
      jsonParsingFailed: 'JSON parsing failed',
      copiedJson: 'JSON copied.',
      copyJson: 'Copy JSON',
      copiedPrettyJson: 'Pretty JSON copied.',
      copiedMinifiedJson: 'Minified JSON copied.',
      downloadPretty: 'Download Pretty',
      downloadMinified: 'Download Minified',
      indentTooltip:
        'Choose how many spaces to use when pretty-printing JSON output.',
      sortKeysTooltip: 'Order object keys alphabetically before formatting.',
      treeDepthTooltip:
        'Control how many nesting levels automatically expand in the tree view.',
    },
    url: {
      title: 'URL Encode/Decode',
      description:
        'Encode special characters and decode percent-encoded URLs instantly.',
      inputPlaceholder: 'Type or paste content here...',
      resultPlaceholder: 'Result will appear here...',
      useSpacePlus: 'Use + for spaces',
      useSpacePlusTooltip:
        "Encode spaces as '+' instead of '%20', like HTML forms.",
      inputOutputSwap: 'Input/Output Swap',
      decodingFailed: 'Decoding failed',
    },
    base64: {
      title: 'Base64 Converter',
      description:
        'Encode text to Base64 or decode Base64 strings with UTF-8 and URL-safe support.',
      textInput: 'Text Input',
      base64Input: 'Base64 Input',
      textPlaceholder: 'Type text to encode...',
      base64Placeholder: 'Paste Base64 string...',
      resultPlaceholder: 'Result will appear here...',
      urlSafe: 'URL Safe',
      urlSafeTooltip:
        'Use the URL-safe Base64 alphabet (- and _) and omit padding.',
      inputOutputSwap: 'Input/Output Swap',
      conversionFailed: 'Base64 conversion failed',
    },
    time: {
      title: 'Epoch / ISO Converter',
      description:
        'Convert between Unix timestamps and ISO 8601 dates with timezone support.',
      epochTimestamp: 'Epoch Timestamp',
      epochPlaceholder: 'e.g. 1704067200000',
      isoDate: 'ISO 8601 Date',
      isoPlaceholder: 'e.g. 2024-01-01T00:00:00.000Z',
      milliseconds: 'milliseconds',
      seconds: 'seconds',
      local: 'Local',
      utc: 'UTC',
      localTimezone: 'Local timezone',
      utcTimezone: 'UTC timezone',
      setToNow: 'Set to Now',
      basicFormats: 'Basic Formats',
      standardFormats: 'Standard Formats',
      humanReadable: 'Human Readable',
      timezoneFormats: 'Timezone Formats',
      localTime: 'Local Time',
      unixSeconds: 'Unix (seconds)',
      unixMilliseconds: 'Unix (milliseconds)',
      humanReadableGlobal: 'Human Readable (Global)',
      humanReadableKorea: 'Human Readable (Korea)',
      dayOfWeek: 'Day of Week',
      usEastern: 'US Eastern',
      usPacific: 'US Pacific',
      uk: 'UK',
      koreaJapan: 'Korea/Japan',
      china: 'China',
      epochInputError: 'Epoch input error',
      isoInputError: 'ISO input error',
      pleaseEnterNumeric: 'Please enter a numeric value.',
      numberOutOfRange: 'Number is out of range.',
      epochValueInvalid: 'Epoch value is invalid.',
      isoFormatInvalid: 'ISO 8601 format is invalid.',
      epochTooltip:
        'Epoch timestamp is the number of seconds or milliseconds since January 1, 1970 UTC.',
      isoTooltip:
        'ISO 8601 is an international standard for date and time representation.',
      msTooltip:
        'Interpret as milliseconds since 1970-01-01 UTC (JavaScript Date format).',
      secTooltip:
        'Interpret as seconds since 1970-01-01 UTC (Unix timestamp format).',
      localTooltip: 'Display conversions relative to your local timezone.',
      utcTooltip:
        'Display conversions relative to UTC (Coordinated Universal Time).',
    },
    yaml: {
      title: 'YAML ↔ JSON',
      description:
        'Convert between YAML and JSON formats bidirectionally with syntax validation.',
      yamlInput: 'YAML Input',
      jsonInput: 'JSON Input',
      yamlOutput: 'YAML Output',
      jsonOutput: 'JSON Output',
      switchDirection: 'Switch Direction',
      conversionFailed: 'Conversion failed',
      convertingLargeFile: 'Converting large file...',
      copiedOutput: 'Output copied.',
      indentTooltip: 'Adjust the indentation width for converted output.',
    },
    diff: {
      title: 'Text Diff',
      description:
        'Compare two texts side-by-side and highlight additions, deletions, and changes.',
      original: 'Original',
      modified: 'Modified',
      splitView: 'Split View',
      unifiedView: 'Unified View',
      hunkView: 'Hunk View',
      ignoreWhitespace: 'Ignore Whitespace',
      ignoreCase: 'Ignore Case',
      ignoreWhitespaceTooltip: 'Ignore changes that only involve whitespace.',
      ignoreCaseTooltip: 'Compare case-insensitively.',
      downloadUnified: 'Download Unified',
      diffResult: 'Diff Result',
      addedChars: '+{n} chars',
      removedChars: '-{n} chars',
      addedLines: '+{n} lines',
      removedLines: '-{n} lines',
      bothIdentical: 'Both inputs are identical.',
      calculatingDiff: 'Calculating diff for large text...',
      copiedUnifiedDiff: 'Unified diff output copied.',
      contextLines: 'Context',
      contextLinesTooltip:
        'Number of unchanged lines to show around each change.',
      expandCollapsed: 'Expand {n} hidden lines',
    },
    cron: {
      title: 'Cron Parser',
      description:
        'Parse cron expressions, explain schedules in plain English, and preview next runs.',
      cronExpression: 'Cron Expression',
      humanReadable: 'Human readable',
      nextScheduledDates: 'Next Scheduled Dates',
      includeSeconds: 'Include seconds field',
      timezone: 'Timezone',
      nextRuns: 'Next runs',
      items10: '10 items',
      items20: '20 items',
      items50: '50 items',
      cronParsingError: 'Cron parsing error',
      pleaseEnterCron: 'Enter a cron expression.',
      expectedFields: 'Expected {n} fields but received {m}.',
      secondsTooltip:
        'Switch to 6-field cron format with a leading seconds column.',
      timezoneTooltip: 'Choose the timezone for calculating upcoming runs.',
      nextRunsTooltip: 'Set how many future executions to preview.',
      // v1.3.2 - Spec/Dialect support
      spec: 'Spec',
      specTooltip: 'Select the cron dialect/specification format.',
      specAuto: 'Auto Detect',
      specAutoDesc: 'Automatically detect the cron format',
      specUnix: 'UNIX/Vixie',
      specUnixDesc: 'Standard 5-field cron',
      specUnixSeconds: 'UNIX + Seconds',
      specUnixSecondsDesc: '6-field cron with seconds',
      specQuartz: 'Quartz',
      specQuartzDesc: 'Quartz Scheduler format (supports ? L W #)',
      specAws: 'AWS EventBridge',
      specAwsDesc: 'AWS cron format with cron(...) wrapper',
      specK8s: 'Kubernetes',
      specK8sDesc: 'K8s CronJob format (supports @hourly, @daily)',
      specJenkins: 'Jenkins',
      specJenkinsDesc: 'Jenkins Pipeline cron with H hash token',
      // Normalized display
      normalized: 'Normalized',
      awsFormat: 'AWS format',
      // From datetime
      fromDateTime: 'From',
      fromDateTimeTooltip: 'Set the base datetime for calculating next runs.',
      now: 'Now',
      // Field breakdown
      fieldBreakdown: 'Field Breakdown',
      fieldSeconds: 'Seconds',
      fieldMinutes: 'Minutes',
      fieldHours: 'Hours',
      fieldDom: 'Day of Month',
      fieldMonth: 'Month',
      fieldDow: 'Day of Week',
      fieldYear: 'Year',
      // Warnings
      warnings: 'Notes',
      warningDomDowOr:
        'UNIX cron: When both day-of-month and day-of-week are specified, they use OR semantics (runs if either matches).',
      warningDomDowExclusive:
        'Must use ? in either day-of-month or day-of-week field.',
      warningAwsDomDow:
        'AWS EventBridge: Cannot use * in both day-of-month and day-of-week. Use ? in one field.',
      warningJenkinsHash:
        'Jenkins H token: Short intervals may cause irregular execution at month boundaries.',
      warningAwsTz:
        'AWS EventBridge schedules use UTC by default. Specify a timezone in the schedule if needed.',
      warningK8sTz:
        'Kubernetes CronJob: Use .spec.timeZone field for timezone support.',
      // Special tokens
      specialTokens: 'Special Tokens',
      tokenQuestion: '? - No specific value (placeholder)',
      tokenL: 'L - Last day of month/week',
      tokenW: 'W - Nearest weekday',
      tokenHash: '# - Nth weekday of month (e.g., 2#1 = first Monday)',
      tokenH: 'H - Hash-based value for load distribution',
      // Copy formats
      copyIso: 'Copy as ISO',
      copyRfc3339: 'Copy as RFC3339',
      copyEpoch: 'Copy as Epoch',
      copiedNextRuns: 'Next runs copied.',
    },
    hash: {
      title: 'Hash Generator',
      description:
        'Calculate hash values and HMAC signatures for text or files',
      modeHash: 'Hash',
      modeHmac: 'HMAC',
      mode: 'Mode',
      text: 'Text',
      inputTypeText: 'Text',
      inputTypeFile: 'File',
      inputType: 'Input Type',
      inputTypeTooltip: 'Select input type: text or file.',
      algorithm: 'Algorithm',
      outputEncoding: 'Output Encoding',
      keyEncoding: 'Key Encoding',
      hmacKey: 'HMAC Key',
      hmacKeyPlaceholder: 'Enter HMAC key...',
      enterHmacKeyPlaceholder: 'Enter HMAC key...',
      verification: 'Verification',
      verificationTooltip: 'Verify hash/HMAC against an expected value.',
      expectedMacPlaceholder: 'Enter expected MAC to verify...',
      enterExpectedMacPlaceholder: 'Enter expected MAC to verify...',
      saveKeyInShareLinks: 'Save key in share links',
      saveKeyWarning:
        'Warning: Saving HMAC keys in share links may expose sensitive information.',
      generateRandom: 'Generate Random',
      generateRandomKey: 'Generate random key',
      hashResult: 'Hash Result',
      calculating: 'Calculating...',
      dropFileHere: 'Drop a file here or click to browse',
      maxFileSize: 'Max 100MB',
      file: 'File',
      fileName: 'File',
      fileSize: 'Size',
      size: 'Size',
      modified: 'Modified',
      matchSuccess: 'Match: MAC verification successful',
      matchFailed: 'Mismatch: MAC verification failed',
      verificationSuccess: 'Match: MAC verification successful',
      verificationFailed: 'Mismatch: MAC verification failed',
      randomKeyGenerated: 'Random key generated',
      failedToGenerateKey: 'Failed to generate random key',
      hashCopied: 'Hash copied to clipboard',
      fileSharingNotSupported:
        'File sharing is not supported. Please switch to text mode.',
      enterTextPlaceholder: 'Enter text to hash...',
      resultPlaceholder: 'Hash result will appear here...',
      note: 'Note',
      securityNote:
        'For checksum verification only. Not suitable for security purposes.',
      securityWarning: 'Security Warning',
      algorithmWarning:
        '{algorithm} is cryptographically broken and should not be used for security purposes. Use SHA-256 or SHA-512.',
      hmacKeyWarning:
        'Warning: Saving HMAC keys in share links may expose sensitive information.',
      rawText: 'Raw Text (UTF-8)',
      rawTextUtf8: 'Raw Text (UTF-8)',
      hex: 'Hex',
      base64: 'Base64',
      modeTooltip:
        'Select normal Hash or HMAC (Hash-based Message Authentication Code).',
      algorithmTooltip:
        'Select hash algorithm. SHA-256 is recommended for most use cases.',
      outputEncodingTooltip:
        'Select output format. Hex is human-readable, Base64 is compact.',
      keyEncodingTooltip: 'HMAC key encoding format.',
      webCryptoNotSupported: 'Web Crypto API is not supported in your browser.',
      processingTimeout: 'Processing timeout. File may be too large.',
      failedToCalculateHash: 'Failed to calculate hash',
      failedToCalculateFileHash: 'Failed to calculate file hash',
    },
    uuid: {
      title: 'UUID Generator',
      description: 'Generate UUID v4, UUID v7, and ULID identifiers',
      type: 'Type',
      count: 'Count',
      format: 'Format',
      uuidV4: 'UUID v4 (random)',
      uuidV7: 'UUID v7 (timestamp-based)',
      ulid: 'ULID (shorter timestamp-based)',
      uuidV4Desc:
        'Completely random UUID. Best for unique identifiers where ordering does not matter.',
      uuidV7Desc:
        'Timestamp-based UUID. Naturally sortable by generation time.',
      ulidDesc:
        '26-character identifier. Lexicographically sortable, shorter than UUID.',
      lowercase: 'lowercase',
      uppercase: 'UPPERCASE',
      regenerate: 'Regenerate',
      generatedIds: 'Generated IDs',
      idCopied: 'ID copied to clipboard',
      allIdsCopied: 'All IDs copied to clipboard',
      copyAll: 'Copy All',
      typeTooltip:
        'Select ID type (UUID v4: random, UUID v7: timestamp-based, ULID: shorter).',
      countTooltip: 'Number of IDs to generate (1-100).',
      formatTooltip: 'Output format (lowercase or uppercase).',
      countHint: 'Max 100 at once',
      formatHint: 'Case style for output',
      resultPlaceholder: 'Generated ID will appear here',
    },
    password: {
      title: 'Password Generator',
      description:
        'Generate cryptographically secure passwords with custom length and character rules.',
      length: 'Length',
      characterTypes: 'Character Types',
      characterTypesTooltip:
        'Select which character sets to include in the password. Using multiple types increases security.',
      exclusionOptions: 'Exclusion Options',
      exclusionOptionsTooltip:
        'Exclude characters that may be confusing or problematic in certain contexts.',
      uppercase: 'Uppercase (A-Z)',
      lowercase: 'Lowercase (a-z)',
      numbers: 'Numbers (0-9)',
      symbols: 'Symbols (!@#$...)',
      excludeSimilar: 'Exclude similar characters (i, l, 1, L, o, 0, O)',
      excludeSimilarTooltip:
        'Remove characters that look similar to each other (i/l/1/I, o/0/O) to avoid confusion when reading passwords.',
      excludeAmbiguous: 'Exclude ambiguous symbols',
      excludeAmbiguousTooltip:
        'Remove symbols that may be hard to distinguish or cause issues in some systems: {}[]()/\\\'"`~,;:.<>',
      count: 'Count',
      regenerate: 'Regenerate',
      generatedPasswords: 'Generated Passwords',
      strength: 'Strength',
      strengthTooltip:
        'Password strength is calculated based on entropy - the combination of length and character set size.',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      veryStrong: 'Very Strong',
      passwordCopied: 'Password copied to clipboard',
      allPasswordsCopied: 'All passwords copied to clipboard',
      atLeastOneCharType: 'At least one character type must be selected',
      lengthError: 'Password length must be between 4 and 128',
      failedToGenerate: 'Failed to generate password',
      resultPlaceholder: 'Generated password will appear here',
      lengthTooltip: 'Password length (4-128 characters). Longer passwords are more secure.',
      countTooltip: 'Number of passwords to generate at once (1-20).',
    },
    urlParser: {
      title: 'URL Parser',
      description:
        'Break down URLs into protocol, host, path, query parameters, and fragment.',
      inputPlaceholder:
        'Enter a URL or query string (e.g., https://example.com/search?q=laptop)...',
      urlOrQueryString: 'URL or Query String',
      urlInformation: 'URL Information',
      parameters: 'Parameters',
      protocol: 'Protocol',
      host: 'Host',
      path: 'Path',
      fragment: 'Fragment',
      key: 'Key',
      value: 'Value',
      actions: 'Actions',
      showDecodedValues: 'Show decoded values',
      showRawValues: 'Show raw values',
      showDecodedTooltip: 'Show decoded (readable) values.',
      showRawTooltip: 'Show raw (encoded) values alongside decoded values.',
      encoded: 'Encoded',
      empty: '(empty)',
      parsingFailed: 'Parsing failed',
      noQueryStringFound:
        'No query string found. Please enter a URL with query parameters.',
      noParametersFound: 'No query parameters found.',
      copiedProtocol: 'Protocol copied.',
      copiedHost: 'Host copied.',
      copiedPath: 'Path copied.',
      copiedFragment: 'Fragment copied.',
      copiedQueryString: 'Query string copied.',
      copiedParameter: 'Parameter "{key}" copied.',
    },
    regex: {
      title: 'Regex Tester',
      description:
        'Test regex patterns with live match highlighting, group capture, and replacements.',
      pattern: 'Pattern',
      patternPlaceholder: 'Enter regular expression pattern...',
      flags: 'Flags',
      testText: 'Test Text',
      testTextPlaceholder: 'Enter text to test against the pattern...',
      replacementPreview: 'Replacement Preview',
      replacementPlaceholder:
        'Enter replacement string (use $1, $2, $<name> for groups)...',
      replacementResult: 'Replacement Result',
      matches: 'Matches',
      presets: 'Presets',
      first: 'First',
      all: 'All',
      replaceFirst: 'First',
      replaceAll: 'All',
      validation: 'Validation',
      extraction: 'Extraction',
      formatting: 'Formatting',
      matchNumber: 'Match #{n}',
      matchInfo: 'Match #{n} at index {index} (length: {length})',
      atIndex: 'at index {n}',
      lengthLabel: 'length: {n}',
      groups: 'Groups',
      namedGroups: 'Named Groups',
      noMatches:
        'No matches found. Enter a pattern and test text to see results.',
      noMatchesFound:
        'No matches found. Enter a pattern and test text to see results.',
      appliedPreset: 'Applied preset: {name}',
      presetApplied: 'Applied preset: {name}',
      patternFeatures: 'Pattern Features',
      clickToExpand: 'Click to expand',
      note: 'Note',
      securityNote:
        'This tool uses JavaScript RegExp engine. Be cautious with complex patterns.',
      flagsTooltip:
        'g=global, i=ignore case, m=multiline, s=dotAll, u=unicode, y=sticky',
      // Regex spec categories
      specCharacterClasses: 'Character Classes',
      specCharacterClassesDesc:
        'Predefined character sets for matching specific types of characters',
      specQuantifiers: 'Quantifiers',
      specQuantifiersDesc:
        'Specify how many times a character, group, or character class should be matched',
      specAnchors: 'Anchors',
      specAnchorsDesc:
        'Assert positions in the string without consuming characters',
      specGroups: 'Groups',
      specGroupsDesc:
        'Group parts of a pattern together and capture or reference them',
      specCharacterSets: 'Character Sets',
      specCharacterSetsDesc: 'Match any one of a set of characters',
      specFlags: 'Flags',
      specFlagsDesc: 'Modify the behavior of the regular expression',
      specUnicode: 'Unicode Features',
      specUnicodeDesc: 'Unicode-specific matching capabilities',
      // Pattern descriptions - Character Classes
      patternDigitName: 'Digit',
      patternDigitDesc: 'Matches any digit (0-9). Equivalent to [0-9].',
      patternDigitExample: '\\d+ matches one or more digits',
      patternNonDigitName: 'Non-digit',
      patternNonDigitDesc:
        'Matches any character that is not a digit. Equivalent to [^0-9].',
      patternNonDigitExample: '\\D+ matches one or more non-digit characters',
      patternWordCharName: 'Word Character',
      patternWordCharDesc:
        'Matches any word character (alphanumeric plus underscore). Equivalent to [A-Za-z0-9_].',
      patternWordCharExample: '\\w+ matches one or more word characters',
      patternNonWordCharName: 'Non-word Character',
      patternNonWordCharDesc:
        'Matches any non-word character. Equivalent to [^A-Za-z0-9_].',
      patternNonWordCharExample: '\\W+ matches one or more non-word characters',
      patternWhitespaceName: 'Whitespace',
      patternWhitespaceDesc:
        'Matches any whitespace character (space, tab, newline, etc.).',
      patternWhitespaceExample:
        '\\s+ matches one or more whitespace characters',
      patternNonWhitespaceName: 'Non-whitespace',
      patternNonWhitespaceDesc: 'Matches any non-whitespace character.',
      patternNonWhitespaceExample:
        '\\S+ matches one or more non-whitespace characters',
      patternDotEscapedName: 'Dot (Escaped)',
      patternDotEscapedDesc:
        'Matches a literal dot character. The dot (.) without escape matches any character except newline.',
      patternDotEscapedExample: '\\. matches a literal dot',
      patternNewlineName: 'Newline',
      patternNewlineDesc: 'Matches a newline character.',
      patternNewlineExample: '\\n matches a newline',
      patternTabName: 'Tab',
      patternTabDesc: 'Matches a tab character.',
      patternTabExample: '\\t matches a tab',
      patternCarriageReturnName: 'Carriage Return',
      patternCarriageReturnDesc: 'Matches a carriage return character.',
      patternCarriageReturnExample: '\\r matches a carriage return',
      // Pattern descriptions - Quantifiers
      patternZeroOrMoreName: 'Zero or More',
      patternZeroOrMoreDesc:
        'Matches zero or more occurrences of the preceding element.',
      patternZeroOrMoreExample: "a* matches zero or more 'a' characters",
      patternOneOrMoreName: 'One or More',
      patternOneOrMoreDesc:
        'Matches one or more occurrences of the preceding element.',
      patternOneOrMoreExample: "a+ matches one or more 'a' characters",
      patternZeroOrOneName: 'Zero or One',
      patternZeroOrOneDesc:
        'Matches zero or one occurrence of the preceding element (makes it optional).',
      patternZeroOrOneExample: "a? matches zero or one 'a' character",
      patternExactlyNName: 'Exactly N',
      patternExactlyNDesc:
        'Matches exactly n occurrences of the preceding element.',
      patternExactlyNExample: "a{3} matches exactly three 'a' characters",
      patternNOrMoreName: 'N or More',
      patternNOrMoreDesc:
        'Matches n or more occurrences of the preceding element.',
      patternNOrMoreExample: "a{3,} matches three or more 'a' characters",
      patternBetweenNMName: 'Between N and M',
      patternBetweenNMDesc:
        'Matches between n and m occurrences of the preceding element.',
      patternBetweenNMExample:
        "a{3,5} matches between three and five 'a' characters",
      patternLazyZeroOrMoreName: 'Lazy Zero or More',
      patternLazyZeroOrMoreDesc:
        'Non-greedy (lazy) version of *. Matches as few characters as possible.',
      patternLazyZeroOrMoreExample:
        "a*? matches zero or more 'a' characters (lazy)",
      patternLazyOneOrMoreName: 'Lazy One or More',
      patternLazyOneOrMoreDesc:
        'Non-greedy (lazy) version of +. Matches as few characters as possible.',
      patternLazyOneOrMoreExample:
        "a+? matches one or more 'a' characters (lazy)",
      patternLazyZeroOrOneName: 'Lazy Zero or One',
      patternLazyZeroOrOneDesc: 'Non-greedy (lazy) version of ?.',
      patternLazyZeroOrOneExample:
        "a?? matches zero or one 'a' character (lazy)",
      // Pattern descriptions - Anchors
      patternStartOfStringName: 'Start of String',
      patternStartOfStringDesc:
        "Matches the start of the string (or start of line with 'm' flag).",
      patternStartOfStringExample:
        "^abc matches 'abc' at the start of the string",
      patternEndOfStringName: 'End of String',
      patternEndOfStringDesc:
        "Matches the end of the string (or end of line with 'm' flag).",
      patternEndOfStringExample: "abc$ matches 'abc' at the end of the string",
      patternWordBoundaryName: 'Word Boundary',
      patternWordBoundaryDesc:
        'Matches a word boundary (between a word character and a non-word character).',
      patternWordBoundaryExample: "\\bword\\b matches 'word' as a whole word",
      patternNonWordBoundaryName: 'Non-word Boundary',
      patternNonWordBoundaryDesc:
        'Matches a position that is not a word boundary.',
      patternNonWordBoundaryExample:
        "\\Bword\\B matches 'word' not at word boundaries",
      // Pattern descriptions - Groups
      patternCapturingGroupName: 'Capturing Group',
      patternCapturingGroupDesc:
        'Groups and captures the matched text. Can be referenced with $1, $2, etc.',
      patternCapturingGroupExample: "(abc) captures 'abc' as group 1",
      patternNonCapturingGroupName: 'Non-capturing Group',
      patternNonCapturingGroupDesc:
        'Groups without capturing. Useful for applying quantifiers without creating a capture group.',
      patternNonCapturingGroupExample: "(?:abc) groups 'abc' without capturing",
      patternNamedCapturingGroupName: 'Named Capturing Group',
      patternNamedCapturingGroupDesc:
        'Creates a named capture group that can be referenced by name.',
      patternNamedCapturingGroupExample:
        "(?<name>abc) captures 'abc' as group named 'name'",
      patternPositiveLookaheadName: 'Positive Lookahead',
      patternPositiveLookaheadDesc:
        "Asserts that what follows matches the pattern, but doesn't consume characters.",
      patternPositiveLookaheadExample:
        "abc(?=def) matches 'abc' only if followed by 'def'",
      patternNegativeLookaheadName: 'Negative Lookahead',
      patternNegativeLookaheadDesc:
        'Asserts that what follows does NOT match the pattern.',
      patternNegativeLookaheadExample:
        "abc(?!def) matches 'abc' only if NOT followed by 'def'",
      patternPositiveLookbehindName: 'Positive Lookbehind',
      patternPositiveLookbehindDesc:
        "Asserts that what precedes matches the pattern, but doesn't consume characters.",
      patternPositiveLookbehindExample:
        "(?<=abc)def matches 'def' only if preceded by 'abc'",
      patternNegativeLookbehindName: 'Negative Lookbehind',
      patternNegativeLookbehindDesc:
        'Asserts that what precedes does NOT match the pattern.',
      patternNegativeLookbehindExample:
        "(?<!abc)def matches 'def' only if NOT preceded by 'abc'",
      patternBackreferenceName: 'Backreference',
      patternBackreferenceDesc:
        'References a previously captured group by number.',
      patternBackreferenceExample: "(abc)\\1 matches 'abcabc'",
      patternNamedBackreferenceName: 'Named Backreference',
      patternNamedBackreferenceDesc:
        'References a previously captured named group.',
      patternNamedBackreferenceExample:
        "(?<name>abc)\\k<name> matches 'abcabc'",
      // Pattern descriptions - Character Sets
      patternCharacterClassName: 'Character Class',
      patternCharacterClassDesc:
        'Matches any one character from the set. Use ^ at the start to negate.',
      patternCharacterClassExample: "[abc] matches 'a', 'b', or 'c'",
      patternNegatedCharacterClassName: 'Negated Character Class',
      patternNegatedCharacterClassDesc: 'Matches any character NOT in the set.',
      patternNegatedCharacterClassExample:
        "[^abc] matches any character except 'a', 'b', or 'c'",
      patternCharacterRangeName: 'Character Range',
      patternCharacterRangeDesc: 'Matches a range of characters.',
      patternCharacterRangeExample: '[a-z] matches any lowercase letter',
      // Pattern descriptions - Flags
      patternGlobalFlagName: 'Global',
      patternGlobalFlagDesc:
        'Find all matches rather than stopping after the first match.',
      patternGlobalFlagExample: '/pattern/g finds all occurrences',
      patternCaseInsensitiveFlagName: 'Case Insensitive',
      patternCaseInsensitiveFlagDesc: 'Case-insensitive matching.',
      patternCaseInsensitiveFlagExample:
        "/pattern/i matches 'Pattern', 'PATTERN', etc.",
      patternMultilineFlagName: 'Multiline',
      patternMultilineFlagDesc:
        'Makes ^ and $ match the start/end of each line, not just the string.',
      patternMultilineFlagExample:
        "/^pattern$/m matches 'pattern' at the start of any line",
      patternDotAllFlagName: 'DotAll',
      patternDotAllFlagDesc: 'Makes . match newline characters as well.',
      patternDotAllFlagExample: '/pattern./s allows . to match newlines',
      patternUnicodeFlagName: 'Unicode',
      patternUnicodeFlagDesc:
        'Enables full Unicode matching. Treats pattern as a sequence of Unicode code points.',
      patternUnicodeFlagExample: '/\\u{1F600}/u matches Unicode emoji',
      patternStickyFlagName: 'Sticky',
      patternStickyFlagDesc:
        'Matches only from the index indicated by the lastIndex property.',
      patternStickyFlagExample: '/pattern/y matches only at lastIndex',
      patternHasIndicesFlagName: 'HasIndices',
      patternHasIndicesFlagDesc: 'Generates indices for substring matches.',
      patternHasIndicesFlagExample:
        '/pattern/d includes indices in match results',
      patternUnicodeSetsFlagName: 'UnicodeSets',
      patternUnicodeSetsFlagDesc:
        'Enables Unicode set mode with improved character class handling.',
      patternUnicodeSetsFlagExample:
        '/[\\p{Letter}]/v matches Unicode letter properties',
      // Pattern descriptions - Unicode
      patternUnicodeEscapeName: 'Unicode Escape',
      patternUnicodeEscapeDesc:
        'Matches a Unicode character by its code point.',
      patternUnicodeEscapeExample: "\\u0041 matches 'A'",
      patternUnicodeCodePointName: 'Unicode Code Point',
      patternUnicodeCodePointDesc:
        "Matches a Unicode character by its code point (requires 'u' flag).",
      patternUnicodeCodePointExample: '\\u{1F600} matches 😀',
      patternUnicodePropertyName: 'Unicode Property',
      patternUnicodePropertyDesc:
        "Matches characters with a specific Unicode property (requires 'u' or 'v' flag).",
      patternUnicodePropertyExample: '\\p{Letter} matches any Unicode letter',
      patternNegatedUnicodePropertyName: 'Negated Unicode Property',
      patternNegatedUnicodePropertyDesc:
        'Matches characters without a specific Unicode property.',
      patternNegatedUnicodePropertyExample:
        '\\P{Letter} matches any non-letter character',
    },
    jwtDecoder: {
      title: 'JWT Decoder',
      description:
        'Decode JWTs to inspect header, payload, expiration, and verify signatures.',
      jwtToken: 'JWT Token',
      jwtTokenTooltip:
        'JSON Web Token (JWT) is a compact, URL-safe token format used for securely transmitting information between parties as a JSON object.',
      tokenPlaceholder:
        'Paste JWT token (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)',
      validationStatus: 'Validation Status',
      validationStatusTooltip:
        'Checks if the token is expired (exp), not yet valid (nbf), and shows when it was issued (iat).',
      signatureVerification: 'Signature Verification',
      signatureVerificationTooltip:
        'Verifies that the token was signed with the expected key and has not been tampered with.',
      header: 'Header',
      headerTooltip:
        'Contains metadata about the token type and signing algorithm (e.g., alg, typ).',
      payload: 'Payload',
      payloadTooltip:
        'Contains the claims - statements about the user and additional data (e.g., sub, name, exp, iat).',
      signature: 'Signature',
      signatureTooltip:
        'Cryptographic signature to verify the token integrity. Created using the header, payload, and a secret key.',
      verificationKey: 'Verification Key',
      verificationKeyTooltip:
        'For HMAC (HS256/384/512): enter the secret key. For RSA/ECDSA: enter the public key in PEM format.',
      verificationKeyPlaceholder: 'Enter verification key',
      enterVerificationKey: 'Enter verification key',
      hmacKeyPlaceholder: 'Enter HMAC secret key (for HS256, HS384, HS512)',
      publicKeyPlaceholder:
        'Enter public key (PEM format for RS256/RS384/RS512/ES256/ES384/ES512)',
      valid: 'Valid',
      invalid: 'Invalid',
      verified: 'Verified',
      failed: 'Failed',
      notVerified: 'Not verified',
      tokenExpired: 'Token has expired',
      expiredAt: 'Expired at {time}',
      tokenNotYetValid: 'Token is not yet valid',
      validFrom: 'Valid from {time}',
      tokenValid: 'Token is valid (not expired)',
      tokenIsValid: 'Token is valid (not expired)',
      issuedAt: 'Issued at: {time}',
      signatureValid: 'Signature is valid',
      signatureVerificationFailed:
        'Signature verification failed. The token may have been tampered with or the key is incorrect.',
      enterKeyToVerify: 'Enter a key above to verify the signature',
      invalidJwtFormat:
        'Invalid JWT format. Expected 3 parts separated by dots (header.payload.signature).',
      invalidJwtFormatDetails:
        'Invalid JWT format. Expected 3 parts separated by dots (header.payload.signature).',
      failedToDecodeHeader:
        'Failed to decode JWT header. Invalid Base64URL encoding.',
      failedToDecodePayload:
        'Failed to decode JWT payload. Invalid Base64URL encoding.',
      failedToDecodeToken: 'Failed to decode JWT token.',
      enterJwtToDecode: 'Enter a JWT token to decode it.',
      enterTokenToDecode: 'Enter a JWT token to decode it.',
      signatureNote:
        'Note: Signature verification is not performed. This tool only decodes the token.',
      signatureIsValid: 'Signature is valid.',
      verificationFailed: 'Verification failed',
      raw: 'Raw',
    },
    jwtEncoder: {
      title: 'JWT Encoder',
      description:
        'Create signed JWTs with custom header, payload, and HMAC algorithms.',
      headerJson: 'Header (JSON)',
      headerJsonTooltip:
        'JWT header contains metadata: "alg" specifies the signing algorithm, "typ" is usually "JWT".',
      headerPlaceholder: '{"alg":"HS256","typ":"JWT"}',
      payloadJson: 'Payload (JSON)',
      payloadJsonTooltip:
        'JWT payload contains claims. Common claims: "sub" (subject), "exp" (expiration), "iat" (issued at), "iss" (issuer).',
      payloadPlaceholder: '{"sub":"1234567890","name":"John Doe"}',
      algorithm: 'Algorithm',
      algorithmTooltip:
        'HS256/384/512 use HMAC with SHA-256/384/512. "none" creates an unsigned token (not recommended for production).',
      algorithmNote: '(updates header.alg)',
      secretKey: 'Secret Key',
      secretKeyTooltip:
        'The secret key used to sign the JWT. Keep this secure - anyone with this key can create valid tokens.',
      secretKeyPlaceholder: 'Enter secret key for signing',
      encodedJwtToken: 'Encoded JWT Token',
      noneUnsigned: 'None (unsigned)',
      invalidHeaderJson: 'Invalid JSON in header',
      invalidPayloadJson: 'Invalid JSON in payload',
      secretKeyRequired: 'Secret key is required for signing',
      unsupportedAlgorithm:
        'Unsupported algorithm: {alg}. Only HS256, HS384, HS512, none are supported.',
    },
    stringLength: {
      title: 'String Length',
      description: 'Count characters, words, lines, and bytes in your text.',
      inputPlaceholder: 'Enter or paste text here...',
      statistics: 'Statistics',
      characters: 'Characters',
      charactersNoSpaces: 'Without Spaces',
      words: 'Words',
      lines: 'Lines',
      bytes: 'Bytes (UTF-8)',
      uploadFile: 'Upload File',
      loadFromUrl: 'Load from URL',
      loadSample: 'Sample',
      urlInputLabel: 'Enter URL',
      invalidUrl: 'Invalid URL format.',
      urlProtocolError: 'Only HTTP and HTTPS URLs are supported.',
      urlLoadedSuccess: 'Text loaded from URL.',
      urlLoadFailed: 'Failed to load from URL.',
      sampleLoaded: 'Sample text loaded.',
      corsWarningTitle: 'CORS Restrictions',
      corsWarningDescription:
        'Some websites may block requests from other domains. If loading fails, try downloading the file manually.',
      loadButton: 'Load',
    },
    curl: {
      title: 'cURL Parser',
      description:
        'Parse cURL commands into method, URL, headers, cookies, and body components.',
      pasteHint: 'Paste cURL command',
      placeholder:
        'curl -X POST https://api.example.com/v1/users -H "Content-Type: application/json" -d \'{"name":"John"}\'',
      parse: 'Parse',
      parseSuccess: 'cURL command parsed successfully',
      parseFailed: 'Failed to parse cURL command',
      openInApiTester: 'Open in API Tester',
      requestSummary: 'Request Summary',
      queryParams: 'Query Parameters',
      headers: 'Headers',
      cookies: 'Cookies',
      body: 'Body',
      options: 'cURL Options',
      warnings: 'Warnings',
      method: 'Method',
      url: 'URL',
      urlDecodeInDisplay: 'URL Decode in display',
      urlDecodeTooltip: 'Decode URL-encoded values for better readability',
      cookieDecode: 'Cookie decode',
      cookieDecodeTooltip: 'Decode URL-encoded cookie values',
      hideSensitiveValues: 'Hide sensitive values',
      hideSensitiveTooltip:
        'Mask Authorization headers and other sensitive data',
      emptyState: 'Paste a cURL command to parse and visualize',
      noQueryParams: 'No query parameters',
      noHeaders: 'No headers',
      noBody: 'No body',
      disabled: 'disabled',
      sensitive: 'sensitive',
      raw: 'Raw',
      parsed: 'Parsed',
      code: 'Code',
      followRedirects: 'Follow redirects',
      insecureTLSBrowser: 'Insecure TLS - not supported in browser',
      basicAuth: 'Basic Auth',
      unsupportedFileNote: 'unsupported - select file in API Tester',
      file: 'File',
      // Copy-related keys
      copiedMethod: 'Method copied to clipboard!',
      copiedUrl: 'URL copied to clipboard!',
      copiedParam: 'Parameter "{key}" copied to clipboard!',
      copiedAllParams: 'All parameters copied to clipboard!',
      copyAllParams: 'Copy all parameters',
      copiedHeader: 'Header "{key}" copied to clipboard!',
      copiedAllHeaders: 'All headers copied to clipboard!',
      copyAllHeaders: 'Copy all headers',
      copiedCookie: 'Cookie "{key}" copied to clipboard!',
      copiedAllCookies: 'All cookies copied to clipboard!',
      copyAllCookies: 'Copy all cookies',
      copiedBody: 'Body copied to clipboard!',
      copyBody: 'Copy body',
      copiedBodyField: 'Field "{key}" copied to clipboard!',
      // Table column headers
      key: 'Key',
      value: 'Value',
      actions: 'Actions',
      empty: 'empty',
      // JSON Viewer integration
      openInJsonViewer: 'Open in JSON Viewer',
    },
    apiTester: {
      title: 'API Tester',
      description:
        'Build and send HTTP requests with headers, body, and CORS bypass via extension.',
      urlPlaceholder: 'Enter URL or paste cURL command',
      send: 'Send',
      cancel: 'Cancel',
      history: 'History',
      favorites: 'Favorites',
      recent: 'Recent',
      clearHistory: 'Clear All',
      noHistory: 'No requests yet',
      showHistory: 'Show History',
      hideHistory: 'Hide History',
      searchHistory: 'Search history...',
      noMatchingRequests: 'No matching requests',
      queryParams: 'Query',
      headers: 'Headers',
      body: 'Body',
      response: 'Response',
      mode: 'Mode',
      direct: 'Direct',
      extension: 'Extension',
      copyAsCurl: 'Copy as cURL',
      extensionConnected: 'CORS Bypass Ready',
      extensionNotConnected: 'Not Connected',
      installExtension: 'Install Extension',
      installExtensionTooltip:
        'Install extension to bypass CORS restrictions. Not needed if the API allows cross-origin requests.',
      extensionPermissionRequired: 'Permission Required',
      extensionChecking: 'Checking...',
      extensionTooltipChecking:
        'Verifying extension connection. Please wait...',
      extensionTooltipNotConnected:
        'Extension not detected. Install the CORS Helper extension to bypass CORS restrictions. Click to retry detection.',
      extensionTooltipPermissionRequired:
        'Extension detected but needs permission for this domain. Click the extension icon and allow access to continue.',
      extensionTooltipConnected:
        'Extension connected and ready! CORS restrictions will be bypassed automatically when needed.',
      retryWithExtension: 'Retry with Extension',
      corsErrorTitle: 'CORS Error Detected',
      corsErrorDescription:
        "This request was blocked by the browser's CORS policy.",
      corsErrorExplanation:
        "Browsers block requests to different domains for security. APIs must explicitly allow cross-origin requests, but many don't when accessed from web apps.",
      corsWhyExtension: 'Why use an extension?',
      corsWhyExtensionDesc:
        "The browser extension can bypass CORS restrictions by making requests from the extension context, which isn't subject to the same security rules as web pages.",
      corsRetryWithExtension: 'Retry with Extension',
      corsInstallExtension: 'Install Chrome Extension',
      corsMobileNotSupported: 'Chrome extensions are not available on mobile devices',
      corsMobileUseDesktop: 'Please use the desktop version of Chrome to access APIs with CORS restrictions.',
      corsRememberChoice: 'Remember for this domain',
      corsRememberChoiceDesc: 'Automatically use extension for {origin}',
      sendToApiDiff: 'Send to API Diff',
      setAsDomainA: 'Set as Domain A',
      setAsDomainB: 'Set as Domain B',
      sentToApiDiff: 'Sent to API Diff as Domain {domain}',
      learnMoreCors: 'Learn more about CORS',
      corsAllowedOrigins: 'Allowed Origins',
      corsManageAllowlist: 'Manage',
      corsClearAllowlist: 'Clear All',
      corsNoAllowedOrigins: 'No origins in allowlist',
      corsOriginAdded: 'Origin added to CORS bypass list',
      corsOriginRemoved: 'Origin removed from CORS bypass list',
      bodyNone: 'none',
      bodyRaw: 'raw',
      bodyJson: 'JSON',
      bodyUrlencoded: 'x-www-form-urlencoded',
      bodyFormData: 'form-data',
      validJson: 'Valid JSON',
      invalidJson: 'Invalid JSON',
      formatJson: 'Format',
      minifyJson: 'Minify',
      addText: '+ Add Text',
      addFile: '+ Add File',
      chooseFile: 'Choose File',
      responseBody: 'Body',
      responseHeaders: 'Headers',
      viewTree: 'Tree',
      viewPretty: 'Pretty',
      viewRaw: 'Raw',
      downloadBinary: 'Download',
      binaryResponse: 'Binary response',
      sendingRequest: 'Sending request...',
      sendRequestToSee: 'Send a request to see the response',
      viaMethod: 'via {method}',
      // Error messages
      errorTimeout: 'Request timeout after {ms}ms',
      errorCors:
        'Request failed. This may be due to CORS restrictions. Try using Extension mode.',
      errorNetwork: 'Network error',
      errorUnknown: 'An unknown error occurred',
      errorPermissionDenied:
        'Permission denied for {origin}. Please grant permission and try again.',
      errorExtension: 'Extension request failed',
      rename: 'Rename',
      openInJsonViewer: 'Open in JSON Viewer',
      openInYamlConverter: 'Open in YAML Converter',
      processing: 'Processing...',
      delete: 'Delete',
      requestName: 'Request name',
      timeoutError: 'Request timeout after {ms}ms',
      networkError: 'Network error',
      permissionDenied:
        'Permission denied for {origin}. Please grant permission and try again.',
      // Include Cookies option
      includeCookies: 'Include Cookies',
      includeCookiesTooltip:
        'Include browser cookies in the request. When enabled, cookies stored in your browser for the target domain will be automatically sent with the request.',
      // Error details
      showErrorDetails: 'Show Details',
      hideErrorDetails: 'Hide Details',
    },
    apiDiff: {
      title: 'API Response Diff',
      description:
        'Call two API endpoints simultaneously and highlight JSON response differences.',
      domains: 'Domains',
      domainA: 'Domain A',
      domainB: 'Domain B',
      execute: 'Execute',
      cancel: 'Cancel',
      reset: 'Reset',
      responsesIdentical: 'Responses are identical',
      responsesDifferent: 'Responses are different',
      compareInTextDiff: 'Compare in Text Diff',
      path: 'Path',
      valueA: 'Value A',
      valueB: 'Value B',
      noResponseYet: 'No response yet',
      notValidJson:
        'Response is not valid JSON. View the Raw tab to see the content.',
      viaExtension: 'via Extension',
      viaDirect: 'via Direct',
      viewTree: 'Tree',
      viewPretty: 'Pretty',
      viewRaw: 'Raw',
      showDetails: 'Show details',
      hideDetails: 'Hide details',
      status: 'Status',
      includeCookies: 'Include Cookies',
      includeCookiesTooltip:
        'Include browser cookies when making requests via extension. Cookies from the current browser session will be sent with the request.',
      parameters: 'Parameters',
      headers: 'Headers',
      body: 'Body (JSON)',
      response: 'Response',
      preset: {
        title: 'Domain Presets',
        select: 'Select from presets',
        addNew: 'Add New Preset',
        titlePlaceholder: 'Title (e.g., Production)',
        domainPlaceholder: 'https://api.example.com',
        add: 'Add',
        savedPresets: 'Saved Presets',
        noPresets: 'No presets saved yet',
        remove: 'Remove',
        clearAll: 'Clear All',
        confirmClear: 'Click again to confirm',
        export: 'Export',
        import: 'Import',
        added: 'Preset added',
        removed: 'Preset removed',
        clearedAll: 'All presets cleared',
        selected: 'Domain selected',
        fillBothFields: 'Please fill both title and domain',
        importSuccess: 'Imported {{count}} presets',
        importFailed: 'Failed to import presets',
      },
      validation: {
        pathRequired: 'Please enter a path',
        domainsRequired: 'Please enter both domains',
      },
      extensionConnected: 'Extension connected',
      extensionChecking: 'Checking extension...',
      extensionNotConnected: 'Extension not connected (using direct fetch)',
      usingExtension: 'Using Extension',
      history: {
        title: 'History',
        empty: 'No history yet',
        recentRequests: 'Recent Requests',
        clearAll: 'Clear All',
        confirmClear: 'Click to confirm',
        loaded: 'Configuration loaded from history',
        search: 'Search history...',
        show: 'Show history',
        hide: 'Hide history',
        noMatch: 'No matching history',
      },
    },
  },
  meta: {
    home: {
      title: "Yowu's DevTools",
      description:
        'A privacy-first toolbox for developers. JSON formatting, password generation, hash calculation, UUID creation, and more. All processing happens in your browser.',
    },
    json: {
      title: 'JSON Viewer',
      description:
        'Free online JSON viewer, formatter, and validator. Format JSON with syntax highlighting, collapsible tree view, search, and one-click copy.',
    },
    url: {
      title: 'URL Encoder',
      description:
        'Free online URL encoder and decoder. Percent-encode special characters or decode URLs with full Unicode and UTF-8 support.',
    },
    base64: {
      title: 'Base64 Converter',
      description:
        'Free online Base64 encoder and decoder. Encode text to Base64 or decode Base64 strings with UTF-8 and URL-safe variant support.',
    },
    time: {
      title: 'Time Converter',
      description:
        'Free online epoch timestamp converter. Convert Unix timestamps (seconds/milliseconds) to ISO 8601 dates and vice versa with timezone support.',
    },
    yaml: {
      title: 'YAML Converter',
      description:
        'Free online YAML-JSON converter. Convert between YAML and JSON formats bidirectionally with syntax validation and error reporting.',
    },
    diff: {
      title: 'Text Diff',
      description:
        'Free online text diff tool. Compare two text blocks side-by-side or in unified view with line-by-line and character-level highlighting.',
    },
    cron: {
      title: 'Cron Parser',
      description:
        'Free online cron expression parser. Explain cron schedules in plain English and preview next execution times with multiple dialect support.',
    },
    hash: {
      title: 'Hash Generator',
      description:
        'Free online hash generator. Calculate MD5, SHA-1, SHA-256, SHA-512 hashes for text or files, plus HMAC signatures with key support.',
    },
    uuid: {
      title: 'UUID Generator',
      description:
        'Free online UUID and ULID generator. Generate cryptographically random UUID v4, timestamp-based UUID v7, and sortable ULID identifiers.',
    },
    password: {
      title: 'Password Generator',
      description:
        'Free online password generator. Create cryptographically secure passwords with custom length, character types, and exclusion rules.',
    },
    urlParser: {
      title: 'URL Parser',
      description:
        'Free online URL parser. Break down URLs into protocol, host, path, query parameters, and fragment with decoded value display.',
    },
    regex: {
      title: 'Regex Tester',
      description:
        'Free online regular expression tester. Test regex patterns with live match highlighting, capture groups, and replacement preview.',
    },
    jwtDecoder: {
      title: 'JWT Decoder',
      description:
        'Free online JWT decoder. Decode JSON Web Tokens to inspect header, payload, expiration, and optionally verify HMAC/RSA signatures.',
    },
    jwtEncoder: {
      title: 'JWT Encoder',
      description:
        'Free online JWT encoder. Create signed JSON Web Tokens with custom header, payload, and HS256/HS384/HS512 HMAC algorithms.',
    },
    stringLength: {
      title: 'String Length',
      description:
        'Free online string length counter. Count characters, words, lines, and UTF-8 bytes in your text with file upload support.',
    },
    curl: {
      title: 'cURL Parser',
      description:
        'Free online cURL command parser. Parse cURL into method, URL, headers, cookies, and body components with one-click API Tester import.',
    },
    apiTester: {
      title: 'API Tester',
      description:
        'Free online API tester. Build HTTP requests with all methods, headers, body types, and bypass CORS restrictions via browser extension.',
      curlPaste: {
        applied: 'cURL parsed and applied',
        failed: 'cURL parse failed',
        pasteAsUrl: 'Paste as URL',
        undo: 'Undo',
      },
    },
    apiDiff: {
      title: 'API Response Diff',
      description:
        'Free online API response comparison tool. Call two endpoints simultaneously and highlight JSON response differences side-by-side.',
    },
  },
} as const;

// Helper type to convert literal string types to string
type DeepStringify<T> = T extends string
  ? string
  : T extends object
  ? { [K in keyof T]: DeepStringify<T[K]> }
  : T;

// Export type derived from en-US (source of truth)
// DeepStringify converts all literal string types to 'string' to allow translations
export type I18nResource = DeepStringify<typeof enUS>;
