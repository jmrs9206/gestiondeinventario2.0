const PUBLIC_CODE_PATTERN = /^[A-Za-z0-9_-]{8,80}$/;

function cleanPublicCode(value: string): string | null {
  const code = decodeURIComponent(value.trim()).replace(/^\/+|\/+$/g, '');
  return PUBLIC_CODE_PATTERN.test(code) ? code : null;
}

function extractFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);

  const mobileIndex = segments.indexOf('i');
  if (mobileIndex >= 0 && segments[mobileIndex + 1]) {
    return cleanPublicCode(segments[mobileIndex + 1]);
  }

  const materialsIndex = segments.indexOf('materials');
  if (materialsIndex >= 0 && segments[materialsIndex + 1]) {
    return cleanPublicCode(segments[materialsIndex + 1]);
  }

  return null;
}

export function extractPublicCodeFromQrPayload(payload: string): string | null {
  const rawPayload = payload.trim();
  if (!rawPayload) {
    return null;
  }

  const rawCode = cleanPublicCode(rawPayload);
  if (rawCode) {
    return rawCode;
  }

  try {
    const url = new URL(rawPayload);
    return extractFromPath(url.pathname);
  } catch {
    return extractFromPath(rawPayload.split('?')[0].split('#')[0]);
  }
}
