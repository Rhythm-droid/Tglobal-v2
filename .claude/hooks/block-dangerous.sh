#!/usr/bin/env bash
# block-dangerous.sh — delegates to node helper.
exec node "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-dangerous.mjs"
