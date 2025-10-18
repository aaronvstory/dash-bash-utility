# Serena MCP Server Setup Guide

## 🏗️ Architecture Overview

Serena MCP can be configured at **three different scopes** with a clear priority hierarchy:

```
Local Scope (highest priority)
    ↓
Project Scope (.mcp.json in project root) ← RECOMMENDED
    ↓
User/Global Scope (~/.claude.json)
```

## ✅ Recommended Setup: Project-Scoped Configuration

### Why Project-Scoped?

1. **Per-Project Isolation**: Each project has its own Serena instance with correct `--project` path
2. **Team Sharing**: `.mcp.json` can be committed to git for team collaboration
3. **No Path Conflicts**: Avoids hardcoded paths in global configuration
4. **Clean Architecture**: Global config stays project-agnostic

### Current Project Configuration

**File**: `C:\claude\dash-bash\.mcp.json`

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--context",
        "ide-assistant",
        "--project",
        "C:\\claude\\dash-bash"
      ],
      "description": "Serena MCP server - semantic code intelligence for dash-bash project"
    }
  }
}
```

### Global Configuration (Fallback)

**File**: `C:\Users\d0nbx\.claude.json`

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server"
      ],
      "description": "Serena MCP server - semantic code intelligence"
    }
  }
}
```

**Note**: Global config has NO `--context` or `--project` arguments. It serves as a basic fallback only.

## 🚀 Quick Start for New Projects

### Option 1: Use `/serena-setup` Command

1. Open project in Claude Code
2. Run: `/serena-setup`
3. Restart Claude Code
4. Run: `/serena` to activate

### Option 2: Manual Setup

1. Create `.mcp.json` in project root:
   ```bash
   cd /path/to/your/project
   ```

2. Add configuration:
   ```json
   {
     "mcpServers": {
       "serena": {
         "command": "uvx",
         "args": [
           "--from",
           "git+https://github.com/oraios/serena",
           "serena",
           "start-mcp-server",
           "--context",
           "ide-assistant",
           "--project",
           "C:\\full\\path\\to\\your\\project"
         ],
         "description": "Serena MCP server for this project"
       }
     }
   }
   ```

3. Replace `C:\\full\\path\\to\\your\\project` with your actual project path (Windows format)

4. Restart Claude Code

## 🔧 Environment Variables Support

You can use environment variables in `.mcp.json`:

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--context",
        "ide-assistant",
        "--project",
        "${PROJECT_ROOT}"
      ]
    }
  }
}
```

Syntax:
- `${VAR}` - Use environment variable VAR
- `${VAR:-default}` - Use VAR or "default" if not set

## 📁 File Structure

```
your-project/
├── .mcp.json                    # Project-scoped MCP configuration
├── .serena/                     # Created by Serena when activated
│   └── project.yml              # Project-specific settings
├── .claude/                     # Claude Code project settings
│   ├── commands/                # Custom slash commands
│   │   └── serena.md           # /serena activation command
│   └── settings.local.json     # Project permissions
└── ...

~/.claude.json                   # Global MCP configuration (fallback)
~/.serena/
└── serena_config.yml           # Global Serena settings
```

## 🎯 How Serena Activation Works

### Global Config (without --project)
```
User runs: /serena
    ↓
Global Serena starts (no project binding)
    ↓
❌ No project-specific indexing
```

### Project Config (with --project)
```
User runs: /serena
    ↓
Project-scoped Serena starts with --project flag
    ↓
Serena binds to current project
    ↓
Creates .serena/ folder with project.yml
    ↓
✅ Full semantic indexing of project
```

## 🔍 Troubleshooting

### "Serena MCP server failed"

**Cause**: Missing `--context` and `--project` arguments

**Solution**:
1. Check if `.mcp.json` exists in project root
2. Verify configuration has both `--context` and `--project` args
3. Restart Claude Code

### "Multiple Serena processes"

**Cause**: Both global and project configs active

**Solution**:
- This is normal! Project config takes priority
- Claude Code handles the hierarchy automatically

### "Wrong project being indexed"

**Cause**: Using global config with hardcoded project path

**Solution**:
1. Remove `--project` from global config
2. Create project-specific `.mcp.json`
3. Restart Claude Code

### "Changes to .mcp.json not taking effect"

**Cause**: Configuration loaded only on startup

**Solution**:
1. Save `.mcp.json`
2. **Completely restart Claude Code** (not just reload window)
3. Verify with: `/serena` (should show correct project path)

## 📚 Reference Commands

```bash
# Check if Serena is running
netstat -ano | findstr :24282

# Test dashboard access
curl http://127.0.0.1:24282/dashboard/index.html

# View current project Serena config
cat .mcp.json

# View global Serena config
cat ~/.claude.json | grep -A 15 '"serena"'

# Verify uvx is installed
uvx --version
```

## 🎓 Best Practices

1. **Always use project-scoped configuration** (`.mcp.json`)
2. **Keep global config minimal** (no project-specific arguments)
3. **Commit `.mcp.json` to git** for team collaboration
4. **Use environment variables** for paths that vary between machines
5. **Restart Claude Code** after changing MCP configuration
6. **One Serena instance per project** (configured via `.mcp.json`)

## 🔗 Additional Resources

- [Official Serena Repo](https://github.com/oraios/serena)
- [Claude Code MCP Docs](https://docs.claude.com/en/docs/claude-code/mcp)
- [SmartScope Serena Guide](https://smartscope.blog/en/generative-ai/claude/serena-mcp-implementation-guide/)

## ✅ Current Status

- ✅ Global config cleaned (no project-specific args)
- ✅ Project config created (`.mcp.json`)
- ✅ `/serena-setup` command available for new projects
- ✅ Documentation complete

**Next Steps**:
1. Restart Claude Code to load new configuration
2. Test with `/serena` command
3. Verify dashboard access
