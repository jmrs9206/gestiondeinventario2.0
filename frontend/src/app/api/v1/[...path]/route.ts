import { NextRequest, NextResponse } from 'next/server';

type ProxyBody = Blob | null;

export async function GET(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return proxyRequest(request, params.path);
}

export async function POST(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return proxyRequest(request, params.path);
}

export async function PUT(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return proxyRequest(request, params.path);
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return proxyRequest(request, params.path);
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return proxyRequest(request, params.path);
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const backendBase = process.env.BACKEND_URL || 'http://127.0.0.1:8080';
  
  const path = pathSegments.join('/');
  const searchParams = request.nextUrl.search;
  const url = `${backendBase}/api/v1/${path}${searchParams}`;

  const headers = new Headers(request.headers);
  // Remove host header to avoid issues with target server host verification
  headers.delete('host');

  if (!headers.has('Authorization')) {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  let body: ProxyBody = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.blob();
    } catch {
      body = null;
    }
  }

  try {
    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      redirect: 'manual',
    });

    const responseHeaders = new Headers(response.headers);
    // Remove content-encoding to let Next.js handle it
    responseHeaders.delete('content-encoding');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown proxy error';
    console.error(`Failed to proxy to ${url}:`, error);
    return NextResponse.json({ error: { message: `Proxy failed: ${message}` } }, { status: 502 });
  }
}
