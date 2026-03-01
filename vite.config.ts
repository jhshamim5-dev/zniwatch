import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTaggerPlugin } from "./src/visual-edits/component-tagger-plugin.js";

const logErrorsPlugin = () => ({
  name: "log-errors-plugin",
  transformIndexHtml() {
    return {
      tags: [
        {
          tag: "script",
          injectTo: "head",
          children: `(() => {
            try {
              const logOverlay = () => {
                const el = document.querySelector('vite-error-overlay');
                if (!el) return;
                const root = (el.shadowRoot || el);
                let text = '';
                try { text = root.textContent || ''; } catch (_) {}
                if (text && text.trim()) {
                  const msg = text.trim();
                  console.error('[Vite Overlay]', msg);
                  try {
                    if (window.parent && window.parent !== window) {
                      window.parent.postMessage({
                        type: 'ERROR_CAPTURED',
                        error: { message: msg, stack: undefined, filename: undefined, lineno: undefined, colno: undefined, source: 'vite.overlay' },
                        timestamp: Date.now(),
                      }, '*');
                    }
                  } catch (_) {}
                }
              };
              const obs = new MutationObserver(() => logOverlay());
              obs.observe(document.documentElement, { childList: true, subtree: true });
              window.addEventListener('DOMContentLoaded', logOverlay);
              logOverlay();
            } catch (e) {
              console.warn('[Vite Overlay logger failed]', e);
            }
          })();`
        }
      ]
    };
  },
});

// Dev-only HLS proxy plugin — loaded lazily so it never runs during `vite build`
const hlsProxyPlugin = () => ({
  name: "hls-proxy-plugin",
  apply: "serve" as const,
  async configureServer(server: any) {
    const { handleProxyRequest } = await import("./server/proxy.js");
    server.middlewares.use((req: any, res: any, next: any) => {
      if (handleProxyRequest(req, res)) return;
      next();
    });
  },
  async configurePreviewServer(server: any) {
    const { handleProxyRequest } = await import("./server/proxy.js");
    server.middlewares.use((req: any, res: any, next: any) => {
      if (handleProxyRequest(req, res)) return;
      next();
    });
  },
});

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [
    react(),
    logErrorsPlugin(),
    hlsProxyPlugin(),
    mode === 'development' && componentTaggerPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
// Orchids restart: 1768808338593
