/**
 * Vite Plugin: Local API Handler
 * 
 * Plugin ini menangani request /api/* secara langsung di Vite dev server,
 * meniru behavior Vercel Serverless Functions tanpa perlu menjalankan `vercel dev`.
 * 
 * Ini memecahkan masalah:
 * - 500 errors pada /api/public/surveys
 * - 404 errors pada /api/public/external-tickets
 * - 500 errors pada /api/public/app-settings
 * - 500 errors pada /api/public/internal-tickets
 */

import type { Plugin } from 'vite';
import path from 'path';
import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';

/**
 * Load environment variables from .env.local files manually
 */
function loadEnvFiles() {
    const envFiles = [
        path.resolve(__dirname, '..', '.env.local'),  // Root .env.local (SUPABASE_URL, SUPABASE_ANON_KEY)
        path.resolve(__dirname, '.env.local'),         // kiss/.env.local (VITE_ prefixed)
    ];

    for (const envFile of envFiles) {
        if (fs.existsSync(envFile)) {
            const content = fs.readFileSync(envFile, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const eqIndex = trimmed.indexOf('=');
                    if (eqIndex > 0) {
                        const key = trimmed.substring(0, eqIndex).trim();
                        const value = trimmed.substring(eqIndex + 1).trim();
                        // Don't override existing env vars
                        if (!process.env[key]) {
                            process.env[key] = value;
                        }
                    }
                }
            }
        }
    }

    // Ensure backend env vars are available (fallback from VITE_ prefixed)
    if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
        process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    }
    if (!process.env.SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY) {
        process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
    }
}

/**
 * Parse incoming request body as JSON
 */
function parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            if (!body) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                resolve(body);
            }
        });
        req.on('error', reject);
    });
}

/**
 * Convert IncomingMessage to a mock VercelRequest-like object
 */
function createMockRequest(req: IncomingMessage, body: any) {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    return {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: Object.fromEntries(url.searchParams),
        body: body,
        cookies: {},
    };
}

/**
 * Create a mock VercelResponse-like object that wraps ServerResponse
 */
function createMockResponse(res: ServerResponse) {
    let statusCode = 200;
    let headersSentFlag = false;

    const mockRes: any = {
        get headersSent() {
            return headersSentFlag || res.headersSent;
        },

        setHeader(key: string, value: string) {
            if (!res.headersSent) {
                res.setHeader(key, value);
            }
            return mockRes;
        },

        status(code: number) {
            statusCode = code;
            return mockRes;
        },

        json(data: any) {
            headersSentFlag = true;
            const body = JSON.stringify(data);
            if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.writeHead(statusCode);
            }
            res.end(body);
            return mockRes;
        },

        send(data: any) {
            headersSentFlag = true;
            if (!res.headersSent) {
                res.writeHead(statusCode);
            }
            res.end(typeof data === 'string' ? data : JSON.stringify(data));
            return mockRes;
        },

        end(data?: any) {
            headersSentFlag = true;
            if (!res.headersSent) {
                res.writeHead(statusCode);
            }
            res.end(data);
            return mockRes;
        }
    };

    return mockRes;
}

/**
 * Resolve the API handler file path from the request URL
 * Supports dynamic routes like [id].ts
 */
function resolveApiHandlerPath(urlPath: string): { filePath: string | null, params: Record<string, string> } {
    const apiDir = path.resolve(__dirname, '..', 'api');

    // Remove /api prefix and query string
    let routePath = urlPath.replace(/^\/api\//, '').split('?')[0].replace(/\/$/, '');
    const segments = routePath.split('/');

    // Try direct file match (.ts)
    const directFile = path.join(apiDir, `${routePath}.ts`);
    if (fs.existsSync(directFile)) {
        return { filePath: directFile, params: {} };
    }

    // Try index file in directory
    const indexFile = path.join(apiDir, routePath, 'index.ts');
    if (fs.existsSync(indexFile)) {
        return { filePath: indexFile, params: {} };
    }

    // Try .js extension
    const jsFile = path.join(apiDir, `${routePath}.js`);
    if (fs.existsSync(jsFile)) {
        return { filePath: jsFile, params: {} };
    }

    // Try dynamic routes (e.g., /users/123 -> /users/[id].ts)
    // Check if last segment could be a dynamic parameter
    if (segments.length >= 2) {
        const lastSegment = segments[segments.length - 1];
        const parentPath = segments.slice(0, -1).join('/');
        
        // Try [id].ts pattern
        const dynamicFile = path.join(apiDir, parentPath, '[id].ts');
        if (fs.existsSync(dynamicFile)) {
            return { 
                filePath: dynamicFile, 
                params: { id: lastSegment } 
            };
        }

        // Try [slug].ts pattern
        const slugFile = path.join(apiDir, parentPath, '[slug].ts');
        if (fs.existsSync(slugFile)) {
            return { 
                filePath: slugFile, 
                params: { slug: lastSegment } 
            };
        }
    }

    return { filePath: null, params: {} };
}

export function viteApiPlugin(): Plugin {
    return {
        name: 'vite-local-api',
        configureServer(server) {
            // Load environment variables at startup
            loadEnvFiles();

            console.log('\n🔌 Vite Local API Plugin aktif - menangani /api/* secara lokal');
            console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ SET' : '❌ NOT SET');
            console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET');
            console.log('   Tidak perlu menjalankan vercel dev terpisah!\n');

            // Add middleware BEFORE Vite's own middleware to intercept /api/* requests
            server.middlewares.use(async (req, res, next) => {
                const url = req.url || '';

                // Only handle /api/* requests
                if (!url.startsWith('/api/')) {
                    return next();
                }

                console.log(`\n🎯 [Local API] ${req.method} ${url}`);

                try {
                    // Find the handler file and extract dynamic params
                    const { filePath: handlerPath, params: dynamicParams } = resolveApiHandlerPath(url);

                    if (!handlerPath) {
                        console.log(`❌ [Local API] Handler tidak ditemukan: ${url}`);
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: `API endpoint tidak ditemukan: ${url}`
                        }));
                        return;
                    }

                    console.log(`📂 [Local API] Loading: ${path.relative(path.resolve(__dirname, '..'), handlerPath)}`);
                    if (Object.keys(dynamicParams).length > 0) {
                        console.log(`📋 [Local API] Dynamic params:`, dynamicParams);
                    }

                    // Parse body for POST/PUT/PATCH requests
                    let body = {};
                    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
                        body = await parseBody(req);
                    }

                    // Use Vite's ssrLoadModule for TypeScript support + HMR
                    const module = await server.ssrLoadModule(handlerPath);
                    const handler = module.default;

                    if (typeof handler !== 'function') {
                        console.log(`❌ [Local API] Handler bukan function: ${handlerPath}`);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: 'Handler is not a valid function'
                        }));
                        return;
                    }

                    // Create mock Vercel-compatible request/response objects
                    // Merge dynamic params into query params
                    const mockReq = createMockRequest(req, body);
                    mockReq.query = { ...mockReq.query, ...dynamicParams };
                    const mockRes = createMockResponse(res);

                    // Execute the handler
                    await handler(mockReq, mockRes);

                    console.log(`✅ [Local API] ${req.method} ${url} → ${res.statusCode || 200}`);

                } catch (error: any) {
                    console.error(`❌ [Local API] Error: ${url}`, error.message);
                    if (error.stack) {
                        console.error(error.stack.split('\n').slice(0, 3).join('\n'));
                    }

                    if (!res.headersSent) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: `Server error: ${error.message}`,
                            endpoint: url
                        }));
                    }
                }
            });
        }
    };
}
