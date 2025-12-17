/**
 * cURL Parser Tool - Types
 */

export interface CurlParserState {
  input: string;
  displayOptions: {
    urlDecodeInDisplay: boolean;
    urlEncodeOnExport: boolean;
    cookieDecode: boolean;
    hideSensitiveValues: boolean;
  };
}

export const DEFAULT_STATE: CurlParserState = {
  input: '',
  displayOptions: {
    urlDecodeInDisplay: true,
    urlEncodeOnExport: false,
    cookieDecode: true,
    hideSensitiveValues: true,
  },
};

