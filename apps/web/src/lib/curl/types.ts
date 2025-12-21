/**
 * cURL Parser - Type Definitions
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type BodyKind = 'none' | 'text' | 'json' | 'urlencoded' | 'multipart';

export type CookieSource = 'cookie-flag' | 'cookie-header';

export interface CurlQueryParam {
  key: string;
  value: string;
  enabled: boolean;
}

export interface CurlHeader {
  key: string;
  value: string;
  enabled: boolean;
  sensitive?: boolean;
}

export interface CurlCookieItem {
  key: string;
  value: string;
  sensitive?: boolean;
}

export interface CurlCookies {
  raw: string;
  items: CurlCookieItem[];
  source: CookieSource;
}

export interface CurlUrlencodedItem {
  key: string;
  value: string;
}

export type CurlMultipartItem =
  | { kind: 'field'; key: string; value: string }
  | {
      kind: 'file';
      key: string;
      filename?: string;
      path?: string;
      note: 'unsupported-file-path';
    };

export interface CurlBody {
  kind: BodyKind;
  text?: string; // raw/json
  urlencodedItems?: CurlUrlencodedItem[];
  multipartItems?: CurlMultipartItem[];
}

export interface CurlOptions {
  followRedirects?: boolean; // -L
  insecureTLS?: boolean; // -k
  compressed?: boolean;
  basicAuth?: { user: string; password: string }; // -u
}

export interface CurlRequest {
  method: HttpMethod;
  url: string; // raw
  urlDecoded?: string; // display용
  query: CurlQueryParam[];
  headers: CurlHeader[];
  cookies?: CurlCookies;
  body?: CurlBody;
  options: CurlOptions;
}

export interface CurlWarning {
  code: string;
  message: string;
}

export interface CurlParseResult {
  original: string;
  normalized: string; // 라인 컨티뉴 제거, 토큰 정리된 형태
  request: CurlRequest;
  warnings: CurlWarning[];
}

