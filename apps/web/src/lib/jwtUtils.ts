// JWT 공통 유틸리티 함수

// Base64URL 디코딩 함수
export function base64UrlDecode(str: string): string {
  // Base64URL을 일반 Base64로 변환
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // 패딩 추가
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  // Base64 디코딩
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

// Base64URL 인코딩 함수
export function base64UrlEncode(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  // Uint8Array를 Base64로 직접 변환 (더 안전하고 효율적)
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Base64URL을 바이트 배열로 디코딩하는 함수
export function base64UrlDecodeToBytes(str: string): Uint8Array {
  // Base64URL을 일반 Base64로 변환
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // 패딩 추가
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  // Base64 디코딩하여 바이트 배열로 변환
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

// JWT 서명 검증 함수
export async function verifyJwtSignature(
  token: string,
  key: string,
  algorithm: string
): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [headerRaw, payloadRaw, signatureRaw] = parts;
  const message = `${headerRaw}.${payloadRaw}`;
  const signatureBytes = base64UrlDecodeToBytes(signatureRaw);

  // HMAC 알고리즘 (HS256, HS384, HS512)
  if (algorithm.startsWith('HS')) {
    const hashName = algorithm === 'HS256' ? 'SHA-256' : algorithm === 'HS384' ? 'SHA-384' : 'SHA-512';
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: hashName },
      false,
      ['verify']
    );

    const messageData = encoder.encode(message);

    // signatureBytes는 Uint8Array이므로 올바른 범위의 ArrayBuffer를 사용
    // Uint8Array의 buffer는 전체 ArrayBuffer를 참조할 수 있으므로, 
    // byteOffset과 byteLength를 고려하여 올바른 범위만 사용
    const signatureBuffer = signatureBytes.buffer.slice(
      signatureBytes.byteOffset,
      signatureBytes.byteOffset + signatureBytes.byteLength
    );

    return await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBuffer as ArrayBuffer,
      messageData.buffer as ArrayBuffer
    );
  }

  // RSA 알고리즘 (RS256, RS384, RS512)
  if (algorithm.startsWith('RS')) {
    const hashName = algorithm === 'RS256' ? 'SHA-256' : algorithm === 'RS384' ? 'SHA-384' : 'SHA-512';
    
    // PEM 형식의 공개 키 파싱
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    let pemKey = key.trim();
    
    if (!pemKey.includes(pemHeader)) {
      // PEM 헤더/푸터가 없으면 추가
      pemKey = `${pemHeader}\n${pemKey}\n${pemFooter}`;
    }

    // PEM을 DER로 변환
    const pemContents = pemKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');
    
    const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      binaryDer.buffer as ArrayBuffer,
      {
        name: 'RSA-PSS',
        hash: hashName,
      },
      false,
      ['verify']
    );

    const encoder = new TextEncoder();
    const messageData = encoder.encode(message);

    // RSA-PSS로 검증 시도
    try {
      return await crypto.subtle.verify(
        {
          name: 'RSA-PSS',
          saltLength: 32,
        },
        cryptoKey,
        signatureBytes.buffer as ArrayBuffer,
        messageData.buffer as ArrayBuffer
      );
    } catch {
      // RSA-PSS 실패 시 RSASSA-PKCS1-v1_5로 재시도
      const cryptoKeyPKCS1 = await crypto.subtle.importKey(
        'spki',
        binaryDer.buffer as ArrayBuffer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: hashName,
        },
        false,
        ['verify']
      );

      return await crypto.subtle.verify(
        {
          name: 'RSASSA-PKCS1-v1_5',
        },
        cryptoKeyPKCS1,
        signatureBytes.buffer as ArrayBuffer,
        messageData.buffer as ArrayBuffer
      );
    }
  }

  // ECDSA 알고리즘 (ES256, ES384, ES512)
  if (algorithm.startsWith('ES')) {
    const hashName = algorithm === 'ES256' ? 'SHA-256' : algorithm === 'ES384' ? 'SHA-384' : 'SHA-512';
    const curve = algorithm === 'ES256' ? 'P-256' : algorithm === 'ES384' ? 'P-384' : 'P-521';
    const keyLength = algorithm === 'ES256' ? 32 : algorithm === 'ES384' ? 48 : 66;
    
    // PEM 형식의 공개 키 파싱
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    let pemKey = key.trim();
    
    if (!pemKey.includes(pemHeader)) {
      pemKey = `${pemHeader}\n${pemKey}\n${pemFooter}`;
    }

    const pemContents = pemKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');
    
    const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      binaryDer.buffer as ArrayBuffer,
      {
        name: 'ECDSA',
        namedCurve: curve,
      },
      false,
      ['verify']
    );

    const encoder = new TextEncoder();
    const messageData = encoder.encode(message);
    
    // JWT의 ECDSA 서명은 r과 s 값을 연속으로 배치한 형태 (각각 keyLength 바이트)
    // Web Crypto API는 DER 형식을 요구하므로 변환 필요
    if (signatureBytes.length !== keyLength * 2) {
      throw new Error(`Invalid signature length for ${algorithm}. Expected ${keyLength * 2} bytes.`);
    }

    // DER 형식으로 변환: SEQUENCE { INTEGER r, INTEGER s }
    const r = signatureBytes.slice(0, keyLength);
    const s = signatureBytes.slice(keyLength);
    
    // r과 s의 앞부분 0 제거 (DER INTEGER는 leading zero를 제거)
    let rStart = 0;
    while (rStart < r.length - 1 && r[rStart] === 0) rStart++;
    if ((r[rStart] & 0x80) !== 0) rStart--; // 음수 방지
    
    let sStart = 0;
    while (sStart < s.length - 1 && s[sStart] === 0) sStart++;
    if ((s[sStart] & 0x80) !== 0) sStart--; // 음수 방지
    
    const rBytes = r.slice(rStart);
    const sBytes = s.slice(sStart);
    
    // DER 인코딩
    const derSignature = new Uint8Array(4 + rBytes.length + 4 + sBytes.length);
    let offset = 0;
    
    // SEQUENCE
    derSignature[offset++] = 0x30;
    const seqLength = 2 + rBytes.length + 2 + sBytes.length;
    if (seqLength < 128) {
      derSignature[offset++] = seqLength;
    } else {
      derSignature[offset++] = 0x81;
      derSignature[offset++] = seqLength;
    }
    
    // INTEGER r
    derSignature[offset++] = 0x02;
    derSignature[offset++] = rBytes.length;
    derSignature.set(rBytes, offset);
    offset += rBytes.length;
    
    // INTEGER s
    derSignature[offset++] = 0x02;
    derSignature[offset++] = sBytes.length;
    derSignature.set(sBytes, offset);
    
    return await crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: hashName,
      },
      cryptoKey,
      derSignature.buffer,
      messageData
    );
  }

  throw new Error(`Unsupported algorithm: ${algorithm}. Supported: HS256/HS384/HS512, RS256/RS384/RS512, ES256/ES384/ES512`);
}

