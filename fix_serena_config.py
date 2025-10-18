import json
import shutil
from pathlib import Path

config_path = Path(r"C:\Users\d0nbx\.claude.json")

# Backup first
backup_path = Path(r"C:\Users\d0nbx\.claude.json.backup")
shutil.copy(config_path, backup_path)
print(f"✓ Backup created: {backup_path}")

# Read and parse
print("Reading configuration...")
with open(config_path, 'r', encoding='utf-8') as f:
    config = json.load(f)

# Fix serena configuration
if 'mcpServers' in config and 'serena' in config['mcpServers']:
    print("Found Serena configuration, updating...")
    config['mcpServers']['serena']['args'] = [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--context",
        "ide-assistant",
        "--project",
        r"C:\claude\dash-bash"
    ]
    print("✓ Updated Serena args with --context and --project parameters")
else:
    print("✗ Serena configuration not found in mcpServers")
    exit(1)

# Write back
print("Writing updated configuration...")
with open(config_path, 'w', encoding='utf-8') as f:
    json.dump(config, f, indent=2)

print("\n✓ Configuration updated successfully!")
print("✓ Serena MCP server should now work correctly")
print("\nNew configuration:")
print("Command:", config['mcpServers']['serena']['command'])
print("Args:", config['mcpServers']['serena']['args'])
