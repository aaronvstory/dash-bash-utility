import json
import shutil
from pathlib import Path

config_path = Path(r"C:\Users\d0nbx\.claude.json")

# Backup first
backup_path = Path(r"C:\Users\d0nbx\.claude.json.backup2")
shutil.copy(config_path, backup_path)
print(f"✓ Backup created: {backup_path}")

# Read and parse
print("Reading global configuration...")
with open(config_path, 'r', encoding='utf-8') as f:
    config = json.load(f)

# Revert serena configuration to global (no project-specific args)
if 'mcpServers' in config and 'serena' in config['mcpServers']:
    print("Found Serena configuration, reverting to global setup...")
    # Remove project-specific arguments, keep it generic
    config['mcpServers']['serena']['args'] = [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server"
    ]
    print("✓ Reverted Serena to global configuration (no project path)")
else:
    print("✗ Serena configuration not found in mcpServers")
    exit(1)

# Write back
print("Writing updated configuration...")
with open(config_path, 'w', encoding='utf-8') as f:
    json.dump(config, f, indent=2)

print("\n✓ Global configuration reverted successfully!")
print("\nNew global configuration:")
print("Command:", config['mcpServers']['serena']['command'])
print("Args:", config['mcpServers']['serena']['args'])
print("\nNote: Project-specific configuration should go in .claude/ folder")
