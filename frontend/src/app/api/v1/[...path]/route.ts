import { NextRequest, NextResponse } from 'next/server';

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

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  // DB_HOST is set to 'mysql_db' inside Docker Compose network, otherwise use localhost
  const isDocker = process.env.DB_HOST === 'mysql_db';
  const backendBase = isDocker ? 'http://backend:8080' : 'http://localhost:8080';
  
  const path = pathSegments.join('/');
  const searchParams = request.nextUrl.search;
  const url = `${backendBase}/api/v1/${path}${searchParams}`;

  const headers = new Headers(request.headers);
  // Remove host header to avoid issues with target server host verification
  headers.delete('host');

  let body: any = null;
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
  } catch (error: any) {
    console.error(`Failed to proxy to ${url}:`, error);
    return NextResponse.json({ error: { message: `Proxy failed: ${error.message}` } }, { status: 502 });
  }
}
