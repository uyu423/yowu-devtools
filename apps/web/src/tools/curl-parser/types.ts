/**
 * cURL Parser Tool - Types
 */

export interface CurlParserState {
  input: string;
  displayOptions: {
    urlDecodeInDisplay: boolean;
    urlEncodeOnExport: boolean;
  };
}

export const DEFAULT_STATE: CurlParserState = {
  input: '',
  displayOptions: {
    urlDecodeInDisplay: true,
    urlEncodeOnExport: false,
  },
};

