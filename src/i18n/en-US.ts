// English (en-US) - Source of Truth
export const enUS = {
  common: {
    copy: 'Copy',
    copied: 'Copied!',
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
    removeFromFavorites: 'Remove from favorites',
    addToFavorites: 'Add to favorites',
    lightMode: 'Light Mode',
    systemMode: 'System Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
    selectLanguage: 'Select Language',
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
      'A privacy-first toolbox for developers who want to keep their data on their own machines. All processing happens in your browser—no servers, no trackers, no data collection. Open source and auditable, making common developer tasks (JSON formatting, password generation, hash calculation, UUID creation, and more) fast, secure, and trustworthy.',
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
      description: 'Format JSON instantly and explore the structure as a tree.',
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
      description: 'Safely transform query params or path segments.',
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
      description: 'Encode or decode UTF-8 text, including Base64URL.',
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
      description: 'Switch between epoch timestamps and ISO8601 strings.',
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
      description: 'Convert both directions and inspect parse errors quickly.',
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
      description: 'Spot differences between two text blocks instantly.',
      original: 'Original',
      modified: 'Modified',
      splitView: 'Split View',
      unifiedView: 'Unified View',
      ignoreWhitespace: 'Ignore Whitespace',
      ignoreCase: 'Ignore Case',
      ignoreWhitespaceTooltip: 'Ignore changes that only involve whitespace.',
      ignoreCaseTooltip: 'Compare case-insensitively.',
      downloadUnified: 'Download Unified',
      diffResult: 'Diff Result',
      addedChars: '+{n} chars',
      removedChars: '-{n} chars',
      bothIdentical: 'Both inputs are identical.',
      calculatingDiff: 'Calculating diff for large text...',
      copiedUnifiedDiff: 'Unified diff output copied.',
    },
    cron: {
      title: 'Cron Parser',
      description: 'Explain cron expressions and preview upcoming runs.',
      cronExpression: 'Cron Expression',
      humanReadable: 'Human readable',
      nextScheduledDates: 'Next Scheduled Dates',
      includeSeconds: 'Include seconds field',
      timezone: 'Timezone',
      nextRuns: 'Next runs',
      items10: '10 items',
      items20: '20 items',
      cronParsingError: 'Cron parsing error',
      pleaseEnterCron: 'Enter a cron expression.',
      expectedFields: 'Expected {n} fields but received {m}.',
      secondsTooltip:
        'Switch to 6-field cron format with a leading seconds column.',
      timezoneTooltip: 'Choose the timezone for calculating upcoming runs.',
      nextRunsTooltip: 'Set how many future executions to preview.',
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
      description: 'Generate secure passwords with customizable options',
      length: 'Length',
      characterTypes: 'Character Types',
      exclusionOptions: 'Exclusion Options',
      uppercase: 'Uppercase (A-Z)',
      lowercase: 'Lowercase (a-z)',
      numbers: 'Numbers (0-9)',
      symbols: 'Symbols (!@#$...)',
      excludeSimilar: 'Exclude similar characters (i, l, 1, L, o, 0, O)',
      excludeAmbiguous: 'Exclude ambiguous symbols',
      count: 'Count',
      regenerate: 'Regenerate',
      generatedPasswords: 'Generated Passwords',
      strength: 'Strength',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      veryStrong: 'Very Strong',
      passwordCopied: 'Password copied to clipboard',
      allPasswordsCopied: 'All passwords copied to clipboard',
      atLeastOneType: 'At least one character type must be selected',
      lengthMustBeBetween: 'Password length must be between 4 and 128',
      lengthTooltip: 'Password length (4-128 characters).',
      countTooltip: 'Number of passwords to generate (1-20).',
    },
    urlParser: {
      title: 'URL Parser',
      description:
        'Parse and visualize URL components including protocol, host, path, fragment, and query parameters.',
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
        'Test and visualize regular expressions with match highlighting and replacement preview',
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
        'Decode JSON Web Tokens to view header, payload, and signature.',
      jwtToken: 'JWT Token',
      tokenPlaceholder:
        'Paste JWT token (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)',
      validationStatus: 'Validation Status',
      signatureVerification: 'Signature Verification',
      header: 'Header',
      payload: 'Payload',
      signature: 'Signature',
      verificationKey: 'Verification Key',
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
      failedToDecodeHeader:
        'Failed to decode JWT header. Invalid Base64URL encoding.',
      failedToDecodePayload:
        'Failed to decode JWT payload. Invalid Base64URL encoding.',
      enterJwtToDecode: 'Enter a JWT token to decode it.',
      signatureNote:
        'Note: Signature verification is not performed. This tool only decodes the token.',
      raw: 'Raw',
    },
    jwtEncoder: {
      title: 'JWT Encoder',
      description: 'Encode JSON Web Tokens from header and payload.',
      headerJson: 'Header (JSON)',
      headerPlaceholder: '{"alg":"HS256","typ":"JWT"}',
      payloadJson: 'Payload (JSON)',
      payloadPlaceholder: '{"sub":"1234567890","name":"John Doe"}',
      algorithm: 'Algorithm',
      algorithmNote: '(updates header.alg)',
      secretKey: 'Secret Key',
      secretKeyPlaceholder: 'Enter secret key for signing',
      encodedJwtToken: 'Encoded JWT Token',
      noneUnsigned: 'None (unsigned)',
      invalidJsonHeader: 'Invalid JSON in header',
      invalidJsonPayload: 'Invalid JSON in payload',
      secretKeyRequired: 'Secret key is required for signing',
      unsupportedAlgorithm:
        'Unsupported algorithm: {alg}. Only HS256, HS384, HS512, none are supported.',
    },
  },
  meta: {
    json: {
      title: 'JSON Viewer',
      description:
        'Free online JSON viewer, formatter, and validator. Pretty print JSON with syntax highlighting, tree view, search, and copy features.',
    },
    url: {
      title: 'URL Encoder',
      description:
        'Free online URL encoder and decoder. Encode and decode URL strings with support for special characters and Unicode.',
    },
    base64: {
      title: 'Base64 Converter',
      description:
        'Free online Base64 encoder and decoder. Convert text to Base64 and back with URL-safe variant support.',
    },
    time: {
      title: 'Time Converter',
      description:
        'Free online epoch timestamp converter. Convert between Unix timestamps and ISO 8601 dates with timezone support.',
    },
    yaml: {
      title: 'YAML Converter',
      description:
        'Free online YAML-JSON converter. Convert between YAML and JSON formats with syntax validation.',
    },
    diff: {
      title: 'Text Diff',
      description:
        'Free online text diff tool. Compare two text blocks and visualize differences in split or unified view.',
    },
    cron: {
      title: 'Cron Parser',
      description:
        'Free online cron expression parser. Explain cron schedules and preview upcoming execution times.',
    },
    hash: {
      title: 'Hash Generator',
      description:
        'Free online hash generator. Calculate MD5, SHA-1, SHA-256, SHA-512 hashes and HMAC signatures.',
    },
    uuid: {
      title: 'UUID Generator',
      description:
        'Free online UUID and ULID generator. Generate UUID v4, UUID v7, and ULID identifiers.',
    },
    password: {
      title: 'Password Generator',
      description:
        'Free online password generator. Create secure passwords with customizable length and character options.',
    },
    urlParser: {
      title: 'URL Parser',
      description:
        'Free online URL parser. Parse URL components including protocol, host, path, and query parameters.',
    },
    regex: {
      title: 'Regex Tester',
      description:
        'Free online regular expression tester. Test and visualize regex with match highlighting.',
    },
    jwtDecoder: {
      title: 'JWT Decoder',
      description:
        'Free online JWT decoder. Decode and inspect JSON Web Tokens with signature verification.',
    },
    jwtEncoder: {
      title: 'JWT Encoder',
      description:
        'Free online JWT encoder. Create JSON Web Tokens with custom header and payload.',
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
