@echo off
echo Testing Serena MCP Server connection...
echo.
echo Current directory: %CD%
echo.
echo Running Serena MCP server test...
echo Command: uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "C:\claude\dash-bash"
echo.
echo Press Ctrl+C to stop the server after it starts successfully.
echo.
uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "C:\claude\dash-bash"
