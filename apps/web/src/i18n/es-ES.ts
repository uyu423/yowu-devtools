// Spanish (es-ES)
import type { I18nResource } from './en-US';

export const esES = {
  common: {
    copy: 'Copiar',
    copied: '¡Copiado!',
    paste: 'Pegar',
    clear: 'Borrar',
    reset: 'Restablecer',
    share: 'Compartir',
    error: 'Error',
    loading: 'Cargando',
    download: 'Descargar',
    upload: 'Subir',
    save: 'Guardar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    search: 'Buscar',
    filter: 'Filtrar',
    apply: 'Aplicar',
    ok: 'OK',
    yes: 'Sí',
    no: 'No',
    resetTool: 'Restablecer herramienta',
    shareState: 'Compartir estado',
    input: 'Entrada',
    output: 'Salida',
    result: 'Resultado',
    options: 'Opciones',
    encode: 'Encode',
    decode: 'Decode',
    convert: 'Convertir',
    format: 'Formatear',
    minify: 'Minificar',
    validate: 'Validar',
    generate: 'Generar',
    parse: 'Analizar',
    indent: 'Sangría',
    spaces2: '2 espacios',
    spaces4: '4 espacios',
    copiedResult: 'Resultado copiado.',
    copiedToClipboard: 'Copiado al portapapeles',
    fullscreen: 'Pantalla completa',
    exitFullscreen: 'Salir de pantalla completa',
    processingLargeData: 'Procesando datos grandes...',
    noDataFound: 'No se encontraron datos',
    invalidInput: 'Entrada no válida',
    // File operations
    fileDownloadSuccess: 'Archivo descargado correctamente',
    fileDownloadFailed: 'Error al descargar el archivo',
    fileTooLarge:
      'El archivo es demasiado grande. El tamaño máximo es {size}MB',
    fileLoadedSuccess: 'Archivo "{name}" cargado correctamente',
    fileReadFailed: 'Error al leer el archivo',
    loadingFile: 'Cargando archivo...',
    dropFileOrClick: 'Arrastra un archivo aquí o haz clic para seleccionar',
    accepted: 'Aceptados',
    allTextFiles: 'Todos los archivos de texto',
    max: 'Máx',
    chooseFile: 'Elegir archivo',
    // Share/clipboard
    shareLinkCopied: 'Enlace de compartir copiado.',
    unableToCopyShareLink: 'No se pudo copiar el enlace de compartir.',
    sharedSuccessfully: 'Compartido correctamente.',
    unableToShare: 'No se pudo compartir.',
    sharedUrlInvalid:
      'La URL compartida no es válida. Restaurando estado por defecto.',
    unableToCopy: 'No se pudo copiar al portapapeles.',
  },
  shareModal: {
    title: 'Compartir {toolName}',
    sensitiveWarningTitle: 'Advertencia de datos sensibles',
    sensitiveWarningDescription:
      'Esta herramienta puede contener información sensible. Comparta enlaces solo con partes de confianza. Los datos compartidos serán visibles para cualquier persona con el enlace.',
    includedInShareLink: 'Incluido en el enlace:',
    excludedUiOnly: 'Excluido (solo UI):',
    notShared: 'no compartido',
    footerNote:
      'El enlace de compartir se copiará a su portapapeles. Todo el procesamiento ocurre en su navegador; no se envían datos a los servidores.',
    generateShareLink: 'Generar enlace para compartir',
    copyLink: 'Copiar enlace',
    urlTooLongTitle: 'Enlace demasiado largo',
    urlTooLongDescription:
      'El enlace es demasiado largo ({length} caracteres, máximo {maxLength}). Por favor, reduzca los datos de entrada para crear un enlace compartible.',
  },
  pwa: {
    appReadyOffline: 'La aplicación está lista para usar sin conexión',
    youAreOffline: 'Actualmente estás sin conexión',
    newVersionAvailable: 'Nueva versión disponible',
    newVersionDescription:
      'Una nueva versión de la aplicación está disponible. Actualiza ahora para obtener las últimas funciones.',
    updateNow: 'Actualizar ahora',
    later: 'Más tarde',
    installApp: 'Instalar aplicación',
    installAppDescription:
      'Instala esta aplicación en tu dispositivo para un acceso rápido y uso sin conexión.',
    install: 'Instalar',
    notNow: 'Ahora no',
  },
  sidebar: {
    appName: "Yowu's DevTools",
    goToYowuDev: 'Ir a yowu.dev',
    favorites: 'Favoritos',
    recentTools: 'Recientes',
    allTools: 'Todas las herramientas',
    noToolsLoaded: 'No se pudieron cargar herramientas',
    moreComingSoon: 'Más próximamente...',
    suggestFeature: 'Sugerir una función',
    removeFromFavorites: 'Quitar de favoritos',
    addToFavorites: 'Añadir a favoritos',
    lightMode: 'Modo claro',
    systemMode: 'Modo sistema',
    darkMode: 'Modo oscuro',
    language: 'Idioma',
    selectLanguage: 'Seleccionar idioma',
  },
  commandPalette: {
    searchTools: 'Buscar herramientas...',
    noResults: 'Sin resultados',
    recentlyUsed: 'Recientes',
    favorites: 'Favoritos',
    allTools: 'Todas las herramientas',
    pressEnterToSelect: 'Presiona Enter para seleccionar',
    typeToSearch: 'Escribe para buscar',
    navigate: 'Navegar',
    select: 'Seleccionar',
    close: 'Cerrar',
    recent: 'Recientes',
    addToFavorites: 'Añadir a favoritos',
    removeFromFavorites: 'Eliminar de favoritos',
  },
  homepage: {
    title: "Yowu's DevTools",
    heroDescription:
      'Una caja de herramientas con privacidad primero para desarrolladores que quieren mantener sus datos en sus propias máquinas. Todo el procesamiento ocurre en tu navegador—sin servidores, sin rastreadores, sin recolección de datos. Código abierto y auditable, haciendo tareas comunes de desarrollo (formateo JSON, generación de contraseñas, cálculo de hash, creación de UUID y más) rápidas, seguras y confiables.',
    whyItExists: 'Por qué existe',
    privacyFirst: 'Privacidad primero',
    privacyFirstDescription:
      'todo se ejecuta en tu navegador. Sin envío de datos a servidores, sin rastreo, sin análisis. Tus datos sensibles permanecen en tu máquina.',
    fastEfficient: 'Rápido y eficiente',
    fastEfficientDescription:
      'Command Palette para navegación rápida, soporte de arrastrar y soltar archivos, y Web Workers para manejar grandes conjuntos de datos sin congelar tu navegador.',
    installablePwa: 'PWA instalable',
    installablePwaDescription:
      'funciona sin conexión, se instala como una aplicación independiente, y se actualiza automáticamente cuando hay nuevas versiones disponibles.',
    openAuditable: 'Abierto y auditable',
    openAuditableDescription:
      'cada línea de código es pública. Puedes verificar qué hace cada herramienta y cómo procesa tus datos.',
    hostedOn:
      'Alojado en GitHub Pages como un sitio estático. Todo el procesamiento ocurre en tu navegador.',
    viewOnGithub: 'Ver en GitHub',
    quickNavigation: 'Navegación rápida',
    quickNavigationDescription:
      'Presiona {cmdK} o {ctrlK} para abrir el Command Palette y encontrar rápidamente cualquier herramienta.',
    searchByName: 'Buscar herramientas por nombre o palabras clave',
    navigateWithArrows: 'Navegar con las teclas de flecha',
    accessFavorites: 'Acceder a favoritos y herramientas recientes',
    availableTools: 'Herramientas disponibles',
  },
  tool: {
    json: {
      title: 'JSON Pretty Viewer',
      description:
        'Formatea JSON instantáneamente y explora la estructura en árbol.',
      inputTitle: 'Entrada JSON',
      inputPlaceholder: '{"key": "value"}',
      sortKeys: 'Ordenar Keys',
      treeDepth: 'Profundidad del árbol',
      expandAllLevels: 'Expandir todo',
      setToLevel: 'Establecer en nivel {n}',
      viewTree: 'Tree',
      viewPretty: 'Pretty',
      viewMinified: 'Minified',
      searchPlaceholder: 'Buscar...',
      treeView: 'Tree View',
      prettyJson: 'Pretty JSON',
      minifiedJson: 'Minified JSON',
      pasteJsonHint: 'Pega JSON a la izquierda para ver el resultado.',
      processingLargeJson: 'Procesando JSON grande...',
      jsonParsingFailed: 'Error al analizar JSON',
      copiedJson: 'JSON copiado.',
      copyJson: 'Copiar JSON',
      copiedPrettyJson: 'Pretty JSON copiado.',
      copiedMinifiedJson: 'Minified JSON copiado.',
      downloadPretty: 'Descargar Pretty',
      downloadMinified: 'Descargar Minified',
      indentTooltip: 'Elige cuántos espacios usar al formatear JSON.',
      sortKeysTooltip:
        'Ordena las keys del objeto alfabéticamente antes de formatear.',
      treeDepthTooltip:
        'Controla cuántos niveles se expanden automáticamente en la vista de árbol.',
    },
    url: {
      title: 'URL Encode/Decode',
      description:
        'Transforma parámetros de consulta o segmentos de ruta de forma segura.',
      inputPlaceholder: 'Escribe o pega contenido aquí...',
      resultPlaceholder: 'El resultado aparecerá aquí...',
      useSpacePlus: 'Usar + para espacios',
      useSpacePlusTooltip:
        "Codifica espacios como '+' en lugar de '%20', como los formularios HTML.",
      inputOutputSwap: 'Intercambiar entrada/salida',
      decodingFailed: 'Error al decodificar',
    },
    base64: {
      title: 'Base64 Converter',
      description: 'Codifica o decodifica texto UTF-8, incluyendo Base64URL.',
      textInput: 'Entrada de texto',
      base64Input: 'Entrada Base64',
      textPlaceholder: 'Escribe texto para codificar...',
      base64Placeholder: 'Pega cadena Base64...',
      resultPlaceholder: 'El resultado aparecerá aquí...',
      urlSafe: 'URL Safe',
      urlSafeTooltip:
        'Usa el alfabeto Base64 seguro para URL (- y _), omitiendo el relleno.',
      inputOutputSwap: 'Intercambiar entrada/salida',
      conversionFailed: 'Error en conversión Base64',
    },
    time: {
      title: 'Epoch / ISO Converter',
      description: 'Convierte entre timestamps Epoch y cadenas ISO8601.',
      epochTimestamp: 'Epoch Timestamp',
      epochPlaceholder: 'Ej: 1704067200000',
      isoDate: 'Fecha ISO 8601',
      isoPlaceholder: 'Ej: 2024-01-01T00:00:00.000Z',
      milliseconds: 'milisegundos',
      seconds: 'segundos',
      local: 'Local',
      utc: 'UTC',
      localTimezone: 'Zona horaria local',
      utcTimezone: 'Zona horaria UTC',
      setToNow: 'Establecer ahora',
      basicFormats: 'Formatos básicos',
      standardFormats: 'Formatos estándar',
      humanReadable: 'Legible',
      timezoneFormats: 'Formatos por zona horaria',
      localTime: 'Hora local',
      unixSeconds: 'Unix (segundos)',
      unixMilliseconds: 'Unix (milisegundos)',
      humanReadableGlobal: 'Legible (Global)',
      humanReadableKorea: 'Legible (Corea)',
      dayOfWeek: 'Día de la semana',
      usEastern: 'Este de EE.UU.',
      usPacific: 'Pacífico de EE.UU.',
      uk: 'Reino Unido',
      koreaJapan: 'Corea/Japón',
      china: 'China',
      epochInputError: 'Error de entrada Epoch',
      isoInputError: 'Error de entrada ISO',
      pleaseEnterNumeric: 'Por favor ingresa un valor numérico.',
      numberOutOfRange: 'El número está fuera de rango.',
      epochValueInvalid: 'El valor Epoch no es válido.',
      isoFormatInvalid: 'El formato ISO 8601 no es válido.',
      epochTooltip:
        'El timestamp Epoch es el número de segundos o milisegundos desde el 1 de enero de 1970 UTC.',
      isoTooltip:
        'ISO 8601 es un estándar internacional para la representación de fechas y horas.',
      msTooltip:
        'Interpreta el valor como milisegundos desde 1970-01-01 UTC (formato JavaScript Date).',
      secTooltip:
        'Interpreta el valor como segundos desde 1970-01-01 UTC (formato Unix timestamp).',
      localTooltip:
        'Muestra las conversiones relativas a tu zona horaria local.',
      utcTooltip:
        'Muestra las conversiones relativas a UTC (Tiempo Universal Coordinado).',
    },
    yaml: {
      title: 'YAML ↔ JSON',
      description:
        'Convierte en ambas direcciones e inspecciona errores de análisis rápidamente.',
      yamlInput: 'Entrada YAML',
      jsonInput: 'Entrada JSON',
      yamlOutput: 'Salida YAML',
      jsonOutput: 'Salida JSON',
      switchDirection: 'Cambiar dirección',
      conversionFailed: 'Error en conversión',
      convertingLargeFile: 'Convirtiendo archivo grande...',
      copiedOutput: 'Salida copiada.',
      indentTooltip: 'Ajusta el ancho de sangría para la salida convertida.',
    },
    diff: {
      title: 'Text Diff',
      description:
        'Detecta diferencias entre dos bloques de texto al instante.',
      original: 'Original',
      modified: 'Modificado',
      splitView: 'Vista dividida',
      unifiedView: 'Vista unificada',
      ignoreWhitespace: 'Ignorar espacios',
      ignoreCase: 'Ignorar mayúsculas',
      ignoreWhitespaceTooltip:
        'Ignora cambios que solo involucran espacios en blanco.',
      ignoreCaseTooltip: 'Compara sin distinguir mayúsculas de minúsculas.',
      downloadUnified: 'Descargar Unified',
      diffResult: 'Resultado del Diff',
      addedChars: '+{n} caracteres',
      removedChars: '-{n} caracteres',
      bothIdentical: 'Ambas entradas son idénticas.',
      calculatingDiff: 'Calculando diff para texto grande...',
      copiedUnifiedDiff: 'Salida unified diff copiada.',
    },
    cron: {
      title: 'Cron Parser',
      description:
        'Explica expresiones cron y previsualiza las próximas ejecuciones.',
      cronExpression: 'Expresión Cron',
      humanReadable: 'Explicación legible',
      nextScheduledDates: 'Próximas ejecuciones programadas',
      includeSeconds: 'Incluir campo de segundos',
      timezone: 'Zona horaria',
      nextRuns: 'Próximas ejecuciones',
      items10: '10 elementos',
      items20: '20 elementos',
      items50: '50 elementos',
      cronParsingError: 'Error de análisis Cron',
      pleaseEnterCron: 'Por favor ingresa una expresión cron.',
      expectedFields: 'Se esperaban {n} campos pero se recibieron {m}.',
      secondsTooltip:
        'Cambia al formato cron de 6 campos que incluye una columna de segundos.',
      timezoneTooltip:
        'Elige la zona horaria para calcular las próximas ejecuciones.',
      nextRunsTooltip:
        'Establece cuántas ejecuciones futuras mostrar en la tabla.',
      // v1.3.2 - Spec/Dialect support
      spec: 'Especificación',
      specTooltip: 'Selecciona el dialecto/formato de especificación cron.',
      specAuto: 'Detección automática',
      specAutoDesc: 'Detectar automáticamente el formato cron',
      specUnix: 'UNIX/Vixie',
      specUnixDesc: 'Cron estándar de 5 campos',
      specUnixSeconds: 'UNIX + Segundos',
      specUnixSecondsDesc: 'Cron de 6 campos con segundos',
      specQuartz: 'Quartz',
      specQuartzDesc: 'Formato Quartz Scheduler (soporta ? L W #)',
      specAws: 'AWS EventBridge',
      specAwsDesc: 'Formato cron AWS con envoltorio cron(...)',
      specK8s: 'Kubernetes',
      specK8sDesc: 'Formato CronJob K8s (soporta @hourly, @daily)',
      specJenkins: 'Jenkins',
      specJenkinsDesc: 'Cron Jenkins Pipeline con token hash H',
      // Normalized display
      normalized: 'Normalizado',
      awsFormat: 'Formato AWS',
      // From datetime
      fromDateTime: 'Desde',
      fromDateTimeTooltip:
        'Establece la fecha/hora base para calcular próximas ejecuciones.',
      now: 'Ahora',
      // Field breakdown
      fieldBreakdown: 'Desglose de campos',
      fieldSeconds: 'Segundos',
      fieldMinutes: 'Minutos',
      fieldHours: 'Horas',
      fieldDom: 'Día del mes',
      fieldMonth: 'Mes',
      fieldDow: 'Día de la semana',
      fieldYear: 'Año',
      // Warnings
      warnings: 'Notas',
      warningDomDowOr:
        'UNIX cron: Cuando se especifican día del mes y día de la semana, usan semántica OR (se ejecuta si cualquiera coincide).',
      warningDomDowExclusive:
        'Debe usar ? en el campo de día del mes o día de la semana.',
      warningAwsDomDow:
        'AWS EventBridge: No se puede usar * en ambos campos. Use ? en uno de ellos.',
      warningJenkinsHash:
        'Token H de Jenkins: Intervalos cortos pueden causar ejecuciones irregulares al final del mes.',
      warningAwsTz:
        'AWS EventBridge usa UTC por defecto. Especifica una zona horaria si es necesario.',
      warningK8sTz:
        'Kubernetes CronJob: Use el campo .spec.timeZone para soporte de zona horaria.',
      // Special tokens
      specialTokens: 'Tokens especiales',
      tokenQuestion: '? - Sin valor específico (marcador de posición)',
      tokenL: 'L - Último día del mes/semana',
      tokenW: 'W - Día laborable más cercano',
      tokenHash: '# - N-ésimo día de la semana del mes (ej: 2#1 = primer lunes)',
      tokenH: 'H - Valor basado en hash para distribución de carga',
      // Copy formats
      copyIso: 'Copiar como ISO',
      copyRfc3339: 'Copiar como RFC3339',
      copyEpoch: 'Copiar como Epoch',
      copiedNextRuns: 'Próximas ejecuciones copiadas.',
    },
    hash: {
      title: 'Hash Generator',
      description: 'Calcula valores hash y firmas HMAC para texto o archivos',
      modeHash: 'Hash',
      modeHmac: 'HMAC',
      mode: 'Modo',
      text: 'Texto',
      inputTypeText: 'Texto',
      inputTypeFile: 'Archivo',
      inputType: 'Tipo de entrada',
      inputTypeTooltip: 'Selecciona tipo de entrada: texto o archivo.',
      algorithm: 'Algoritmo',
      outputEncoding: 'Codificación de salida',
      keyEncoding: 'Codificación de Key',
      hmacKey: 'Key HMAC',
      hmacKeyPlaceholder: 'Ingresa key HMAC...',
      enterHmacKeyPlaceholder: 'Ingresa key HMAC...',
      verification: 'Verificación',
      verificationTooltip: 'Verifica hash/HMAC contra un valor esperado.',
      expectedMacPlaceholder: 'Ingresa MAC esperado para verificar...',
      enterExpectedMacPlaceholder: 'Ingresa MAC esperado para verificar...',
      saveKeyInShareLinks: 'Guardar key en enlaces compartidos',
      saveKeyWarning:
        'Advertencia: Guardar keys HMAC en enlaces compartidos puede exponer información sensible.',
      generateRandom: 'Generar aleatoria',
      generateRandomKey: 'Generar key aleatoria',
      hashResult: 'Resultado Hash',
      calculating: 'Calculando...',
      dropFileHere: 'Arrastra un archivo aquí o haz clic para explorar',
      maxFileSize: 'Máx. 100MB',
      file: 'Archivo',
      fileName: 'Archivo',
      fileSize: 'Tamaño',
      size: 'Tamaño',
      modified: 'Modificado',
      matchSuccess: 'Coincide: Verificación MAC exitosa',
      matchFailed: 'No coincide: Verificación MAC fallida',
      verificationSuccess: 'Coincide: Verificación MAC exitosa',
      verificationFailed: 'No coincide: Verificación MAC fallida',
      randomKeyGenerated: 'Key aleatoria generada',
      failedToGenerateKey: 'Error al generar key aleatoria',
      hashCopied: 'Hash copiado al portapapeles',
      fileSharingNotSupported:
        'No se admite compartir archivos. Cambia al modo de texto.',
      enterTextPlaceholder: 'Ingresa texto para hashear...',
      resultPlaceholder: 'El resultado hash aparecerá aquí...',
      note: 'Nota',
      securityNote:
        'Solo para verificación de checksum. No apto para propósitos de seguridad.',
      securityWarning: 'Advertencia de seguridad',
      algorithmWarning:
        '{algorithm} está criptográficamente comprometido y no debe usarse para seguridad. Usa SHA-256 o SHA-512.',
      hmacKeyWarning:
        'Advertencia: Guardar keys HMAC en enlaces compartidos puede exponer información sensible.',
      rawText: 'Texto Raw (UTF-8)',
      rawTextUtf8: 'Texto Raw (UTF-8)',
      hex: 'Hex',
      base64: 'Base64',
      modeTooltip:
        'Selecciona Hash normal o HMAC (Código de Autenticación de Mensajes basado en Hash).',
      algorithmTooltip:
        'Selecciona el algoritmo hash. Se recomienda SHA-256 para la mayoría de casos.',
      outputEncodingTooltip:
        'Selecciona el formato de salida. Hex es legible, Base64 es compacto.',
      keyEncodingTooltip: 'Formato de codificación de la key HMAC.',
      webCryptoNotSupported: 'Tu navegador no soporta Web Crypto API.',
      processingTimeout:
        'Tiempo de procesamiento agotado. El archivo puede ser muy grande.',
      failedToCalculateHash: 'Error al calcular hash',
      failedToCalculateFileHash: 'Error al calcular hash del archivo',
    },
    uuid: {
      title: 'Generador de UUID',
      description: 'Genera identificadores UUID v4, UUID v7 y ULID',
      type: 'Tipo',
      count: 'Cantidad',
      format: 'Formato',
      uuidV4: 'UUID v4 (aleatorio)',
      uuidV7: 'UUID v7 (basado en timestamp)',
      ulid: 'ULID (timestamp más corto)',
      uuidV4Desc:
        'UUID completamente aleatorio. Ideal para identificadores únicos sin ordenamiento.',
      uuidV7Desc:
        'UUID basado en tiempo. Se ordena naturalmente por tiempo de creación.',
      ulidDesc:
        'Identificador de 26 caracteres. Ordenable lexicográficamente, más corto que UUID.',
      lowercase: 'minúsculas',
      uppercase: 'MAYÚSCULAS',
      regenerate: 'Regenerar',
      generatedIds: 'IDs generados',
      idCopied: 'ID copiado al portapapeles',
      allIdsCopied: 'Todos los IDs copiados al portapapeles',
      copyAll: 'Copiar todo',
      typeTooltip:
        'Selecciona el tipo de ID (UUID v4: aleatorio, UUID v7: basado en timestamp, ULID: más corto).',
      countTooltip: 'Número de IDs a generar (1-100).',
      formatTooltip: 'Formato de salida (minúsculas o mayúsculas).',
      countHint: 'Genera hasta 100',
      formatHint: 'Estilo de mayúsculas/minúsculas',
      resultPlaceholder: 'Los IDs generados aparecerán aquí',
    },
    password: {
      title: 'Password Generator',
      description: 'Genera contraseñas seguras con opciones personalizables',
      length: 'Longitud',
      characterTypes: 'Tipos de caracteres',
      exclusionOptions: 'Opciones de exclusión',
      uppercase: 'Mayúsculas (A-Z)',
      lowercase: 'Minúsculas (a-z)',
      numbers: 'Números (0-9)',
      symbols: 'Símbolos (!@#$...)',
      excludeSimilar: 'Excluir caracteres similares (i, l, 1, L, o, 0, O)',
      excludeAmbiguous: 'Excluir símbolos ambiguos',
      count: 'Cantidad',
      regenerate: 'Regenerar',
      generatedPasswords: 'Contraseñas generadas',
      strength: 'Fortaleza',
      weak: 'Débil',
      medium: 'Media',
      strong: 'Fuerte',
      veryStrong: 'Muy fuerte',
      passwordCopied: 'Contraseña copiada al portapapeles',
      allPasswordsCopied: 'Todas las contraseñas copiadas al portapapeles',
      atLeastOneType: 'Se debe seleccionar al menos un tipo de carácter',
      lengthMustBeBetween:
        'La longitud de la contraseña debe estar entre 4 y 128',
      lengthTooltip: 'Longitud de la contraseña (4-128 caracteres).',
      countTooltip: 'Número de contraseñas a generar (1-20).',
    },
    urlParser: {
      title: 'URL Parser',
      description:
        'Analiza y visualiza componentes de URL incluyendo Protocol, Host, Path, Fragment y parámetros Query.',
      inputPlaceholder:
        'Ingresa URL o Query String (ej: https://example.com/search?q=laptop)...',
      urlOrQueryString: 'URL o Query String',
      urlInformation: 'Información de URL',
      parameters: 'Parámetros',
      protocol: 'Protocol',
      host: 'Host',
      path: 'Path',
      fragment: 'Fragment',
      key: 'Key',
      value: 'Valor',
      actions: 'Acciones',
      showDecodedValues: 'Mostrar valores decodificados',
      showRawValues: 'Mostrar valores raw',
      showDecodedTooltip: 'Muestra valores decodificados (legibles).',
      showRawTooltip:
        'Muestra valores raw (codificados) junto a los decodificados.',
      encoded: 'Codificado',
      empty: '(vacío)',
      parsingFailed: 'Error de análisis',
      noQueryStringFound:
        'No se encontró Query String. Ingresa una URL con parámetros de consulta.',
      noParametersFound: 'No se encontraron parámetros Query.',
      copiedProtocol: 'Protocol copiado.',
      copiedHost: 'Host copiado.',
      copiedPath: 'Path copiado.',
      copiedFragment: 'Fragment copiado.',
      copiedQueryString: 'Query String copiado.',
      copiedParameter: 'Parámetro "{key}" copiado.',
    },
    regex: {
      title: 'Regex Tester',
      description:
        'Prueba y visualiza expresiones regulares con resaltado de coincidencias y vista previa de reemplazo',
      pattern: 'Patrón',
      patternPlaceholder: 'Ingresa patrón de expresión regular...',
      flags: 'Flags',
      testText: 'Texto de prueba',
      testTextPlaceholder: 'Ingresa texto para probar contra el patrón...',
      replacementPreview: 'Vista previa de reemplazo',
      replacementPlaceholder:
        'Ingresa cadena de reemplazo (usa $1, $2, $<nombre> para grupos)...',
      replacementResult: 'Resultado de reemplazo',
      matches: 'Coincidencias',
      presets: 'Presets',
      first: 'Primero',
      all: 'Todos',
      replaceFirst: 'Primero',
      replaceAll: 'Todos',
      validation: 'Validación',
      extraction: 'Extracción',
      formatting: 'Formateo',
      matchNumber: 'Coincidencia #{n}',
      matchInfo: 'Coincidencia #{n} en índice {index} (longitud: {length})',
      atIndex: 'índice {n}',
      lengthLabel: 'longitud: {n}',
      groups: 'Grupos',
      namedGroups: 'Grupos nombrados',
      noMatches:
        'No se encontraron coincidencias. Ingresa un patrón y texto de prueba.',
      noMatchesFound:
        'No se encontraron coincidencias. Ingresa un patrón y texto de prueba.',
      appliedPreset: 'Preset aplicado: {name}',
      presetApplied: 'Preset aplicado: {name}',
      patternFeatures: 'Características del patrón',
      clickToExpand: 'Clic para expandir',
      note: 'Nota',
      securityNote:
        'Esta herramienta usa el motor JavaScript RegExp. Ten cuidado con patrones complejos.',
      flagsTooltip:
        'g=global, i=ignorar mayúsculas, m=multilínea, s=dotAll, u=unicode, y=sticky',
      // Regex spec categories
      specCharacterClasses: 'Clases de caracteres',
      specCharacterClassesDesc:
        'Conjuntos de caracteres predefinidos para coincidir con tipos específicos',
      specQuantifiers: 'Cuantificadores',
      specQuantifiersDesc:
        'Especifica cuántas veces debe coincidir un carácter, grupo o clase',
      specAnchors: 'Anclas',
      specAnchorsDesc: 'Afirma posiciones en la cadena sin consumir caracteres',
      specGroups: 'Grupos',
      specGroupsDesc: 'Agrupa partes de un patrón para capturar o referenciar',
      specCharacterSets: 'Conjuntos de caracteres',
      specCharacterSetsDesc: 'Coincide con cualquier carácter del conjunto',
      specFlags: 'Banderas',
      specFlagsDesc: 'Modifica el comportamiento de la expresión regular',
      specUnicode: 'Características Unicode',
      specUnicodeDesc: 'Capacidades de coincidencia específicas de Unicode',
      // Pattern descriptions - Character Classes
      patternDigitName: 'Dígito',
      patternDigitDesc:
        'Coincide con cualquier dígito (0-9). Equivalente a [0-9].',
      patternDigitExample: '\\d+ coincide con uno o más dígitos',
      patternNonDigitName: 'No dígito',
      patternNonDigitDesc:
        'Coincide con cualquier carácter que no sea un dígito. Equivalente a [^0-9].',
      patternNonDigitExample:
        '\\D+ coincide con uno o más caracteres no numéricos',
      patternWordCharName: 'Carácter de palabra',
      patternWordCharDesc:
        'Coincide con cualquier carácter de palabra (alfanumérico más guión bajo). Equivalente a [A-Za-z0-9_].',
      patternWordCharExample:
        '\\w+ coincide con uno o más caracteres de palabra',
      patternNonWordCharName: 'Carácter no de palabra',
      patternNonWordCharDesc:
        'Coincide con cualquier carácter que no sea de palabra. Equivalente a [^A-Za-z0-9_].',
      patternNonWordCharExample:
        '\\W+ coincide con uno o más caracteres no de palabra',
      patternWhitespaceName: 'Espacio en blanco',
      patternWhitespaceDesc:
        'Coincide con cualquier carácter de espacio en blanco (espacio, tabulación, nueva línea, etc.).',
      patternWhitespaceExample:
        '\\s+ coincide con uno o más espacios en blanco',
      patternNonWhitespaceName: 'No espacio en blanco',
      patternNonWhitespaceDesc:
        'Coincide con cualquier carácter que no sea espacio en blanco.',
      patternNonWhitespaceExample:
        '\\S+ coincide con uno o más caracteres no espacios en blanco',
      patternDotEscapedName: 'Punto (escapado)',
      patternDotEscapedDesc:
        'Coincide con un carácter de punto literal. El punto (.) sin escape coincide con cualquier carácter excepto nueva línea.',
      patternDotEscapedExample: '\\. coincide con un punto literal',
      patternNewlineName: 'Nueva línea',
      patternNewlineDesc: 'Coincide con un carácter de nueva línea.',
      patternNewlineExample: '\\n coincide con una nueva línea',
      patternTabName: 'Tabulación',
      patternTabDesc: 'Coincide con un carácter de tabulación.',
      patternTabExample: '\\t coincide con una tabulación',
      patternCarriageReturnName: 'Retorno de carro',
      patternCarriageReturnDesc:
        'Coincide con un carácter de retorno de carro.',
      patternCarriageReturnExample: '\\r coincide con un retorno de carro',
      // Pattern descriptions - Quantifiers
      patternZeroOrMoreName: 'Cero o más',
      patternZeroOrMoreDesc:
        'Coincide con cero o más ocurrencias del elemento anterior.',
      patternZeroOrMoreExample: "a* coincide con cero o más caracteres 'a'",
      patternOneOrMoreName: 'Uno o más',
      patternOneOrMoreDesc:
        'Coincide con una o más ocurrencias del elemento anterior.',
      patternOneOrMoreExample: "a+ coincide con uno o más caracteres 'a'",
      patternZeroOrOneName: 'Cero o uno',
      patternZeroOrOneDesc:
        'Coincide con cero o una ocurrencia del elemento anterior (lo hace opcional).',
      patternZeroOrOneExample: "a? coincide con cero o un carácter 'a'",
      patternExactlyNName: 'Exactamente N',
      patternExactlyNDesc:
        'Coincide exactamente con n ocurrencias del elemento anterior.',
      patternExactlyNExample:
        "a{3} coincide exactamente con tres caracteres 'a'",
      patternNOrMoreName: 'N o más',
      patternNOrMoreDesc:
        'Coincide con n o más ocurrencias del elemento anterior.',
      patternNOrMoreExample: "a{3,} coincide con tres o más caracteres 'a'",
      patternBetweenNMName: 'Entre N y M',
      patternBetweenNMDesc:
        'Coincide entre n y m ocurrencias del elemento anterior.',
      patternBetweenNMExample:
        "a{3,5} coincide entre tres y cinco caracteres 'a'",
      patternLazyZeroOrMoreName: 'Perezoso cero o más',
      patternLazyZeroOrMoreDesc:
        'Versión no codiciosa (perezosa) de *. Coincide con la menor cantidad de caracteres posible.',
      patternLazyZeroOrMoreExample:
        "a*? coincide con cero o más caracteres 'a' (perezoso)",
      patternLazyOneOrMoreName: 'Perezoso uno o más',
      patternLazyOneOrMoreDesc:
        'Versión no codiciosa (perezosa) de +. Coincide con la menor cantidad de caracteres posible.',
      patternLazyOneOrMoreExample:
        "a+? coincide con uno o más caracteres 'a' (perezoso)",
      patternLazyZeroOrOneName: 'Perezoso cero o uno',
      patternLazyZeroOrOneDesc: 'Versión no codiciosa (perezosa) de ?.',
      patternLazyZeroOrOneExample:
        "a?? coincide con cero o un carácter 'a' (perezoso)",
      // Pattern descriptions - Anchors
      patternStartOfStringName: 'Inicio de cadena',
      patternStartOfStringDesc:
        "Coincide con el inicio de la cadena (o inicio de línea con la bandera 'm').",
      patternStartOfStringExample:
        "^abc coincide con 'abc' al inicio de la cadena",
      patternEndOfStringName: 'Fin de cadena',
      patternEndOfStringDesc:
        "Coincide con el fin de la cadena (o fin de línea con la bandera 'm').",
      patternEndOfStringExample:
        "abc$ coincide con 'abc' al final de la cadena",
      patternWordBoundaryName: 'Límite de palabra',
      patternWordBoundaryDesc:
        'Coincide con un límite de palabra (entre un carácter de palabra y uno que no lo es).',
      patternWordBoundaryExample:
        "\\bword\\b coincide con 'word' como palabra completa",
      patternNonWordBoundaryName: 'No límite de palabra',
      patternNonWordBoundaryDesc:
        'Coincide con una posición que no es un límite de palabra.',
      patternNonWordBoundaryExample:
        "\\Bword\\B coincide con 'word' fuera de los límites de palabra",
      // Pattern descriptions - Groups
      patternCapturingGroupName: 'Grupo de captura',
      patternCapturingGroupDesc:
        'Agrupa y captura el texto coincidente. Se puede referenciar con $1, $2, etc.',
      patternCapturingGroupExample: "(abc) captura 'abc' como grupo 1",
      patternNonCapturingGroupName: 'Grupo sin captura',
      patternNonCapturingGroupDesc:
        'Agrupa sin capturar. Útil para aplicar cuantificadores sin crear un grupo de captura.',
      patternNonCapturingGroupExample: "(?:abc) agrupa 'abc' sin capturar",
      patternNamedCapturingGroupName: 'Grupo de captura con nombre',
      patternNamedCapturingGroupDesc:
        'Crea un grupo de captura con nombre que puede referenciarse por nombre.',
      patternNamedCapturingGroupExample:
        "(?<name>abc) captura 'abc' como grupo llamado 'name'",
      patternPositiveLookaheadName: 'Aserción positiva hacia adelante',
      patternPositiveLookaheadDesc:
        'Afirma que lo que sigue coincide con el patrón, pero no consume caracteres.',
      patternPositiveLookaheadExample:
        "abc(?=def) coincide con 'abc' solo si está seguido por 'def'",
      patternNegativeLookaheadName: 'Aserción negativa hacia adelante',
      patternNegativeLookaheadDesc:
        'Afirma que lo que sigue NO coincide con el patrón.',
      patternNegativeLookaheadExample:
        "abc(?!def) coincide con 'abc' solo si NO está seguido por 'def'",
      patternPositiveLookbehindName: 'Aserción positiva hacia atrás',
      patternPositiveLookbehindDesc:
        'Afirma que lo que precede coincide con el patrón, pero no consume caracteres.',
      patternPositiveLookbehindExample:
        "(?<=abc)def coincide con 'def' solo si está precedido por 'abc'",
      patternNegativeLookbehindName: 'Aserción negativa hacia atrás',
      patternNegativeLookbehindDesc:
        'Afirma que lo que precede NO coincide con el patrón.',
      patternNegativeLookbehindExample:
        "(?<!abc)def coincide con 'def' solo si NO está precedido por 'abc'",
      patternBackreferenceName: 'Referencia posterior',
      patternBackreferenceDesc:
        'Referencia un grupo capturado anteriormente por número.',
      patternBackreferenceExample: "(abc)\\1 coincide con 'abcabc'",
      patternNamedBackreferenceName: 'Referencia posterior con nombre',
      patternNamedBackreferenceDesc:
        'Referencia un grupo con nombre capturado anteriormente.',
      patternNamedBackreferenceExample:
        "(?<name>abc)\\k<name> coincide con 'abcabc'",
      // Pattern descriptions - Character Sets
      patternCharacterClassName: 'Clase de caracteres',
      patternCharacterClassDesc:
        'Coincide con cualquier carácter del conjunto. Use ^ al inicio para negar.',
      patternCharacterClassExample: "[abc] coincide con 'a', 'b' o 'c'",
      patternNegatedCharacterClassName: 'Clase de caracteres negada',
      patternNegatedCharacterClassDesc:
        'Coincide con cualquier carácter que NO esté en el conjunto.',
      patternNegatedCharacterClassExample:
        "[^abc] coincide con cualquier carácter excepto 'a', 'b' o 'c'",
      patternCharacterRangeName: 'Rango de caracteres',
      patternCharacterRangeDesc: 'Coincide con un rango de caracteres.',
      patternCharacterRangeExample:
        '[a-z] coincide con cualquier letra minúscula',
      // Pattern descriptions - Flags
      patternGlobalFlagName: 'Global',
      patternGlobalFlagDesc:
        'Encuentra todas las coincidencias en lugar de detenerse después de la primera.',
      patternGlobalFlagExample: '/pattern/g encuentra todas las ocurrencias',
      patternCaseInsensitiveFlagName: 'Sin distinción de mayúsculas',
      patternCaseInsensitiveFlagDesc:
        'Coincidencia sin distinción de mayúsculas y minúsculas.',
      patternCaseInsensitiveFlagExample:
        "/pattern/i coincide con 'Pattern', 'PATTERN', etc.",
      patternMultilineFlagName: 'Multilínea',
      patternMultilineFlagDesc:
        'Hace que ^ y $ coincidan con el inicio/fin de cada línea, no solo de la cadena.',
      patternMultilineFlagExample:
        "/^pattern$/m coincide con 'pattern' al inicio de cualquier línea",
      patternDotAllFlagName: 'DotAll',
      patternDotAllFlagDesc:
        'Hace que . también coincida con caracteres de nueva línea.',
      patternDotAllFlagExample:
        '/pattern./s permite que . coincida con nuevas líneas',
      patternUnicodeFlagName: 'Unicode',
      patternUnicodeFlagDesc:
        'Habilita la coincidencia Unicode completa. Trata el patrón como una secuencia de puntos de código Unicode.',
      patternUnicodeFlagExample: '/\\u{1F600}/u coincide con emoji Unicode',
      patternStickyFlagName: 'Fijo',
      patternStickyFlagDesc:
        'Coincide solo desde el índice indicado por la propiedad lastIndex.',
      patternStickyFlagExample: '/pattern/y coincide solo en lastIndex',
      patternHasIndicesFlagName: 'HasIndices',
      patternHasIndicesFlagDesc:
        'Genera índices para las coincidencias de subcadenas.',
      patternHasIndicesFlagExample:
        '/pattern/d incluye índices en los resultados de coincidencia',
      patternUnicodeSetsFlagName: 'UnicodeSets',
      patternUnicodeSetsFlagDesc:
        'Habilita el modo de conjuntos Unicode con manejo mejorado de clases de caracteres.',
      patternUnicodeSetsFlagExample:
        '/[\\p{Letter}]/v coincide con propiedades de letras Unicode',
      // Pattern descriptions - Unicode
      patternUnicodeEscapeName: 'Escape Unicode',
      patternUnicodeEscapeDesc:
        'Coincide con un carácter Unicode por su punto de código.',
      patternUnicodeEscapeExample: "\\u0041 coincide con 'A'",
      patternUnicodeCodePointName: 'Punto de código Unicode',
      patternUnicodeCodePointDesc:
        "Coincide con un carácter Unicode por su punto de código (requiere bandera 'u').",
      patternUnicodeCodePointExample: '\\u{1F600} coincide con 😀',
      patternUnicodePropertyName: 'Propiedad Unicode',
      patternUnicodePropertyDesc:
        "Coincide con caracteres con una propiedad Unicode específica (requiere bandera 'u' o 'v').",
      patternUnicodePropertyExample:
        '\\p{Letter} coincide con cualquier letra Unicode',
      patternNegatedUnicodePropertyName: 'Propiedad Unicode negada',
      patternNegatedUnicodePropertyDesc:
        'Coincide con caracteres sin una propiedad Unicode específica.',
      patternNegatedUnicodePropertyExample:
        '\\P{Letter} coincide con cualquier carácter no letra',
    },
    jwtDecoder: {
      title: 'JWT Decoder',
      description:
        'Decodifica JSON Web Tokens para ver Header, Payload y Signature.',
      jwtToken: 'Token JWT',
      tokenPlaceholder:
        'Pega token JWT (ej: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)',
      validationStatus: 'Estado de validación',
      signatureVerification: 'Verificación de Signature',
      header: 'Header',
      payload: 'Payload',
      signature: 'Signature',
      verificationKey: 'Key de verificación',
      verificationKeyPlaceholder: 'Ingresa key de verificación',
      enterVerificationKey: 'Ingresa key de verificación',
      hmacKeyPlaceholder: 'Ingresa secret key HMAC (para HS256, HS384, HS512)',
      publicKeyPlaceholder:
        'Ingresa public key (formato PEM para RS256/RS384/RS512/ES256/ES384/ES512)',
      valid: 'Válido',
      invalid: 'Inválido',
      verified: 'Verificado',
      failed: 'Fallido',
      notVerified: 'No verificado',
      tokenExpired: 'El token ha expirado',
      expiredAt: 'Expiró el {time}',
      tokenNotYetValid: 'El token aún no es válido',
      validFrom: 'Válido desde {time}',
      tokenValid: 'El token es válido (no ha expirado)',
      tokenIsValid: 'El token es válido (no ha expirado)',
      issuedAt: 'Emitido: {time}',
      signatureValid: 'La firma es válida',
      signatureVerificationFailed:
        'La verificación de firma falló. El token puede haber sido manipulado o la key es incorrecta.',
      enterKeyToVerify: 'Ingresa una key arriba para verificar la firma',
      invalidJwtFormat:
        'Formato JWT inválido. Se esperan 3 partes separadas por puntos (header.payload.signature).',
      failedToDecodeHeader:
        'Error al decodificar header JWT. Codificación Base64URL inválida.',
      failedToDecodePayload:
        'Error al decodificar payload JWT. Codificación Base64URL inválida.',
      enterJwtToDecode: 'Ingresa un token JWT para decodificarlo.',
      signatureNote:
        'Nota: No se realiza verificación de firma. Esta herramienta solo decodifica el token.',
      raw: 'Raw',
    },
    stringLength: {
      title: 'Calculadora de longitud de cadena',
      description:
        'Calcula el número de caracteres, palabras, líneas y bytes del texto.',
      inputPlaceholder: 'Ingresa texto o arrastra un archivo aquí...',
      characters: 'Caracteres',
      charactersNoSpaces: 'Caracteres (sin espacios)',
      words: 'Palabras',
      lines: 'Líneas',
      bytes: 'Bytes (UTF-8)',
      statistics: 'Estadísticas',
      uploadFile: 'Subir archivo',
      loadFromUrl: 'Cargar desde URL',
      loadSample: 'Ejemplo',
      urlInputLabel: 'Ingresa URL',
      invalidUrl: 'Formato de URL inválido.',
      urlProtocolError: 'Solo se admiten URLs HTTP y HTTPS.',
      urlLoadedSuccess: 'Texto cargado desde URL.',
      urlLoadFailed: 'Error al cargar desde URL.',
      sampleLoaded: 'Texto de ejemplo cargado.',
      corsWarningTitle: 'Restricciones CORS',
      corsWarningDescription: 'Algunos sitios web pueden bloquear solicitudes de otros dominios. Si la carga falla, intenta descargar el archivo manualmente.',
      loadButton: 'Cargar',
    },
    jwtEncoder: {
      title: 'JWT Encoder',
      description: 'Crea JSON Web Tokens a partir de Header y Payload.',
      headerJson: 'Header (JSON)',
      headerPlaceholder: '{"alg":"HS256","typ":"JWT"}',
      payloadJson: 'Payload (JSON)',
      payloadPlaceholder: '{"sub":"1234567890","name":"John Doe"}',
      algorithm: 'Algoritmo',
      algorithmNote: '(actualiza header.alg)',
      secretKey: 'Secret Key',
      secretKeyPlaceholder: 'Ingresa secret key para firmar',
      encodedJwtToken: 'Token JWT codificado',
      noneUnsigned: 'None (sin firma)',
      invalidJsonHeader: 'JSON inválido en header',
      invalidJsonPayload: 'JSON inválido en payload',
      secretKeyRequired: 'Se requiere secret key para firmar',
      unsupportedAlgorithm:
        'Algoritmo no soportado: {alg}. Solo se soportan HS256, HS384, HS512, none.',
    },
    curl: {
      title: 'cURL Parser',
      description: 'Analizar y visualizar comandos cURL',
      pasteHint: 'Pegar comando cURL',
      placeholder:
        'curl -X POST https://api.example.com/v1/users -H "Content-Type: application/json" -d \'{"name":"John"}\'',
      parse: 'Analizar',
      parseSuccess: 'Comando cURL analizado correctamente',
      parseFailed: 'Error al analizar comando cURL',
      openInApiTester: 'Abrir en API Tester',
      requestSummary: 'Resumen de solicitud',
      queryParams: 'Parámetros de consulta',
      headers: 'Encabezados',
      cookies: 'Cookies',
      body: 'Cuerpo',
      options: 'Opciones cURL',
      warnings: 'Advertencias',
      method: 'Método',
      url: 'URL',
      urlDecodeInDisplay: 'Decodificar URL en visualización',
      urlDecodeTooltip: 'Decodificar valores codificados en URL para mejor legibilidad',
      cookieDecode: 'Decodificar cookie',
      cookieDecodeTooltip: 'Decodificar valores de cookie codificados en URL',
      hideSensitiveValues: 'Ocultar valores sensibles',
      hideSensitiveTooltip: 'Enmascarar encabezados Authorization y otros datos sensibles',
      emptyState: 'Pega un comando cURL para analizar y visualizar',
      noQueryParams: 'Sin parámetros de consulta',
      noHeaders: 'Sin encabezados',
      noBody: 'Sin cuerpo',
      disabled: 'deshabilitado',
      sensitive: 'sensible',
      raw: 'Crudo',
      parsed: 'Analizado',
      code: 'Código',
      followRedirects: 'Seguir redirecciones',
      insecureTLSBrowser: 'TLS inseguro - no compatible con navegador',
      basicAuth: 'Autenticación básica',
      unsupportedFileNote: 'no compatible - seleccione archivo en API Tester',
      file: 'Archivo',
      // Claves relacionadas con copiar
      copiedMethod: '¡Método copiado al portapapeles!',
      copiedUrl: '¡URL copiada al portapapeles!',
      copiedParam: '¡Parámetro "{key}" copiado al portapapeles!',
      copiedAllParams: '¡Todos los parámetros copiados al portapapeles!',
      copyAllParams: 'Copiar todos los parámetros',
      copiedHeader: '¡Encabezado "{key}" copiado al portapapeles!',
      copiedAllHeaders: '¡Todos los encabezados copiados al portapapeles!',
      copyAllHeaders: 'Copiar todos los encabezados',
      copiedCookie: '¡Cookie "{key}" copiada al portapapeles!',
      copiedAllCookies: '¡Todas las cookies copiadas al portapapeles!',
      copyAllCookies: 'Copiar todas las cookies',
      copiedBody: '¡Cuerpo copiado al portapapeles!',
      copyBody: 'Copiar cuerpo',
      copiedBodyField: '¡Campo "{key}" copiado al portapapeles!',
      // Encabezados de columna de tabla
      key: 'Clave',
      value: 'Valor',
      actions: 'Acciones',
      empty: 'vacío',
      // Integración con JSON Viewer
      openInJsonViewer: 'Abrir en JSON Viewer',
    },
    apiTester: {
      title: 'API Tester',
      description: 'Prueba APIs REST con constructor de solicitudes y bypass de CORS.',
      urlPlaceholder: 'https://api.example.com/v1/users',
      send: 'Enviar',
      cancel: 'Cancelar',
      history: 'Historial',
      favorites: 'Favoritos',
      recent: 'Recientes',
      clearHistory: 'Borrar todo',
      noHistory: 'No hay solicitudes aún',
      showHistory: 'Mostrar historial',
      hideHistory: 'Ocultar historial',
      searchHistory: 'Buscar historial...',
      noMatchingRequests: 'No hay solicitudes coincidentes',
      queryParams: 'Consulta',
      headers: 'Encabezados',
      body: 'Cuerpo',
      response: 'Respuesta',
      mode: 'Modo',
      direct: 'Directo',
      extension: 'Extensión',
      copyAsCurl: 'Copiar como cURL',
      extensionConnected: 'CORS Bypass Listo',
      extensionNotConnected: 'No conectado',
      installExtension: 'Instalar extensión',
      installExtensionTooltip: 'Instala la extensión para evitar restricciones CORS. No es necesario si la API permite solicitudes de origen cruzado.',
      extensionPermissionRequired: 'Permiso requerido',
      extensionChecking: 'Verificando...',
      extensionTooltipChecking: 'Verificando conexión de extensión...',
      extensionTooltipNotConnected: 'Extensión no detectada. Instala la extensión CORS Helper para evitar restricciones CORS. Haz clic para reintentar.',
      extensionTooltipPermissionRequired: 'Extensión detectada pero necesita permiso para este dominio. Haz clic en el icono de la extensión y permite el acceso.',
      extensionTooltipConnected: '¡Extensión conectada! Las restricciones CORS se evitarán automáticamente cuando sea necesario.',
      retryWithExtension: 'Reintentar con extensión',
      corsErrorTitle: 'Error de CORS Detectado',
      corsErrorDescription: 'Esta solicitud fue bloqueada por la política CORS del navegador.',
      corsErrorExplanation: 'Los navegadores bloquean solicitudes a diferentes dominios por seguridad. Las APIs deben permitir explícitamente solicitudes de origen cruzado, pero muchas no lo hacen cuando se accede desde aplicaciones web.',
      corsWhyExtension: '¿Por qué usar una extensión?',
      corsWhyExtensionDesc: 'La extensión del navegador puede evitar restricciones CORS haciendo solicitudes desde el contexto de la extensión, que no está sujeto a las mismas reglas de seguridad que las páginas web.',
      corsRetryWithExtension: 'Reintentar con extensión',
      corsInstallExtension: 'Instalar extensión de Chrome',
      corsRememberChoice: 'Recordar para este dominio',
      corsRememberChoiceDesc: 'Usar extensión automáticamente para {origin}',
      learnMoreCors: 'Más información sobre CORS',
      corsAllowedOrigins: 'Dominios permitidos',
      corsManageAllowlist: 'Gestionar',
      corsClearAllowlist: 'Borrar todo',
      corsNoAllowedOrigins: 'No hay dominios en la lista permitida',
      corsOriginAdded: 'Dominio añadido a la lista de bypass CORS',
      corsOriginRemoved: 'Dominio eliminado de la lista de bypass CORS',
      bodyNone: 'none',
      bodyRaw: 'raw',
      bodyJson: 'JSON',
      bodyUrlencoded: 'x-www-form-urlencoded',
      bodyFormData: 'form-data',
      validJson: 'JSON válido',
      invalidJson: 'JSON inválido',
      formatJson: 'Formatear',
      minifyJson: 'Minificar',
      addText: '+ Agregar texto',
      addFile: '+ Agregar archivo',
      chooseFile: 'Elegir archivo',
      responseBody: 'Cuerpo',
      responseHeaders: 'Encabezados',
      viewTree: 'Árbol',
      viewPretty: 'Formateado',
      viewRaw: 'Crudo',
      downloadBinary: 'Descargar',
      binaryResponse: 'Respuesta binaria',
      sendingRequest: 'Enviando solicitud...',
      sendRequestToSee: 'Envía una solicitud para ver la respuesta',
      viaMethod: 'vía {method}',
      // Error messages
      errorTimeout: 'Tiempo de espera agotado después de {ms}ms',
      errorCors: 'La solicitud falló. Esto puede deberse a restricciones de CORS. Prueba usando el modo Extension.',
      errorNetwork: 'Error de red',
      errorUnknown: 'Ocurrió un error desconocido',
      errorPermissionDenied: 'Permiso denegado para {origin}. Por favor, concede el permiso e inténtalo de nuevo.',
      errorExtension: 'La solicitud de Extension falló',
      rename: 'Renombrar',
      openInJsonViewer: 'Abrir en JSON Viewer',
      openInYamlConverter: 'Abrir en YAML Converter',
      processing: 'Procesando...',
      delete: 'Eliminar',
      requestName: 'Nombre de solicitud',
      timeoutError: 'Tiempo de espera agotado después de {ms}ms',
      networkError: 'Error de red',
      permissionDenied: 'Permiso denegado para {origin}. Otorga permiso e intenta de nuevo.',
      // Include Cookies option
      includeCookies: 'Incluir Cookies',
      includeCookiesTooltip: 'Incluir las cookies del navegador en la solicitud. Cuando está habilitado, las cookies almacenadas en el navegador para el dominio de destino se enviarán automáticamente con la solicitud.',
      // Error details
      showErrorDetails: 'Mostrar Detalles',
      hideErrorDetails: 'Ocultar Detalles',
    },
  },
  meta: {
    json: {
      title: 'JSON Viewer',
      description:
        'Visor, formateador y validador JSON online gratuito. Embellece JSON con resaltado de sintaxis, vista de árbol, búsqueda y funciones de copia.',
    },
    url: {
      title: 'URL Encoder',
      description:
        'Codificador y decodificador de URL online gratuito. Codifica y decodifica cadenas URL con soporte para caracteres especiales y Unicode.',
    },
    base64: {
      title: 'Base64 Converter',
      description:
        'Codificador y decodificador Base64 online gratuito. Convierte texto a Base64 con soporte para variante segura para URL.',
    },
    time: {
      title: 'Time Converter',
      description:
        'Conversor de timestamp Epoch online gratuito. Convierte entre Unix timestamp y fechas ISO 8601 con soporte de zona horaria.',
    },
    yaml: {
      title: 'YAML Converter',
      description:
        'Conversor YAML-JSON online gratuito. Convierte entre formatos YAML y JSON con validación de sintaxis.',
    },
    diff: {
      title: 'Text Diff',
      description:
        'Herramienta de diferencias de texto online gratuita. Compara dos bloques de texto y visualiza diferencias en vista dividida o unificada.',
    },
    cron: {
      title: 'Cron Parser',
      description:
        'Analizador de expresiones cron online gratuito. Explica programaciones cron y previsualiza próximos tiempos de ejecución.',
    },
    hash: {
      title: 'Hash Generator',
      description:
        'Generador de hash online gratuito. Calcula hashes MD5, SHA-1, SHA-256, SHA-512 y firmas HMAC.',
    },
    uuid: {
      title: 'UUID/ULID Generator',
      description:
        'Generador de UUID y ULID online gratuito. Genera identificadores UUID v4, UUID v7 y ULID.',
    },
    password: {
      title: 'Password Generator',
      description:
        'Generador de contraseñas online gratuito. Crea contraseñas seguras con opciones personalizables de longitud y caracteres.',
    },
    urlParser: {
      title: 'URL Parser',
      description:
        'Analizador de URL online gratuito. Analiza componentes de URL incluyendo protocol, host, path y parámetros query.',
    },
    regex: {
      title: 'Regex Tester',
      description:
        'Probador de expresiones regulares online gratuito. Prueba y visualiza regex con resaltado de coincidencias.',
    },
    jwtDecoder: {
      title: 'JWT Decoder',
      description:
        'Decodificador JWT online gratuito. Decodifica e inspecciona JSON Web Tokens con verificación de firma.',
    },
    jwtEncoder: {
      title: 'JWT Encoder',
      description:
        'Codificador JWT online gratuito. Crea JSON Web Tokens con header y payload personalizados.',
    },
    stringLength: {
      title: 'Calculadora de longitud de cadena',
      description:
        'Calculadora de longitud de cadena online gratuita. Cuenta caracteres, palabras, líneas y bytes (UTF-8) de texto o archivos. Soporta carga de archivos y URL.',
    },
    curl: {
      title: 'cURL Parser',
      description: 'Analizar y visualizar comandos cURL',
    },
    apiTester: {
      title: 'API Tester',
      description:
        'Probador de API online gratuito. Construye y envía solicitudes HTTP con soporte para todos los métodos, encabezados, cuerpo y bypass de CORS mediante extensión.',
      curlPaste: {
        applied: 'cURL analizado y aplicado',
        failed: 'Error al analizar cURL',
        pasteAsUrl: 'Pegar como URL',
        undo: 'Deshacer',
      },
    },
  },
  curl: {
    warning: {
      unsupportedFile: 'Las opciones basadas en archivos no son compatibles. Por favor, pegue el contenido directamente.',
      shellExpansion: 'Expansión de shell detectada. La sustitución de variables no es compatible.',
      configFile: 'El archivo de configuración no es compatible. Por favor, pegue el comando directamente.',
      variableSubstitution: 'La sustitución de variables no es compatible.',
      insecureTLS: 'TLS inseguro (-k) no es compatible en el navegador. Use el modo Extension para pruebas locales.',
      unsupportedCookieFile: 'El archivo de cookies no es compatible. Por favor, pegue la cadena de cookies directamente.',
      unsupportedDataFile: 'El archivo de datos no es compatible. Por favor, pegue los datos directamente.',
    },
  },
} as const satisfies I18nResource;
