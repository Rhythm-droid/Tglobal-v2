#!/usr/bin/env bash
# stop-verify-ui.sh — delegates to node helper.
exec node "${CLAUDE_PROJECT_DIR}/.claude/hooks/stop-verify-ui.mjs"
