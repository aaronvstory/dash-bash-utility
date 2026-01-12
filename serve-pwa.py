#!/usr/bin/env python3
"""
Simple HTTPS server for PWA testing
Run this to serve the app locally with HTTPS support for PWA installation
"""
import http.server
import ssl
import os

# Change to the script's directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Server configuration
PORT = 8443
HOSTNAME = 'localhost'

# Create a simple HTTP request handler with no-cache headers
class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

handler = NoCacheHTTPRequestHandler

# Set MIME types for PWA files
handler.extensions_map['.json'] = 'application/json'
handler.extensions_map['.js'] = 'application/javascript'
handler.extensions_map['.html'] = 'text/html'
handler.extensions_map['.svg'] = 'image/svg+xml'

# Create the server
httpd = http.server.HTTPServer((HOSTNAME, PORT), handler)

print(f"""
╔════════════════════════════════════════════════════════════╗
║             DASH BASH UTILITY PWA SERVER                    ║
╚════════════════════════════════════════════════════════════╝

Server running at: http://{HOSTNAME}:{PORT}

To install as PWA:
1. Open http://{HOSTNAME}:{PORT}/index.html (or just http://{HOSTNAME}:{PORT})
2. Look for install icon in address bar (Edge/Chrome)
3. Or use menu: ⋮ → Apps → Install this site as an app

Note: For local PWA installation without HTTPS, you can:
- Use Edge DevTools (F12) → Application → Manifest → Install
- Or use chrome://flags → enable "Unsecure localhost"

Press Ctrl+C to stop the server
""")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\n\nServer stopped.")
    httpd.shutdown()