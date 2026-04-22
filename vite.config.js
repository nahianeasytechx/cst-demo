import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              try {
                const endpoint = req.url.split('?')[0];
                const filePath = path.resolve(process.cwd(), `.${endpoint}.js`);
                
                if (fs.existsSync(filePath)) {
                  // Dynamically import the handler
                  const module = await import(`file://${filePath}?t=${Date.now()}`);
                  const handler = module.default;

                  // Mock Vercel response helpers
                  res.status = (code) => {
                    res.statusCode = code;
                    return res;
                  };
                  res.json = (data) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  };

                  // Parse body for POST requests
                  if (req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => { body += chunk; });
                    req.on('end', () => {
                      try {
                        req.body = body ? JSON.parse(body) : {};
                      } catch (e) {
                        req.body = {};
                      }
                      
                      // Inject local .env variables into process.env so the handler can read BRIGHTDATA_KEY
                      process.env = { ...process.env, ...env };
                      
                      handler(req, res);
                    });
                  } else {
                    process.env = { ...process.env, ...env };
                    handler(req, res);
                  }
                  return;
                }
              } catch (e) {
                console.error('API Error:', e);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message }));
                return;
              }
            }
            next();
          });
        }
      }
    ]
  };
});
