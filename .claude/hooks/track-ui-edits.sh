#!/usr/bin/env bash
# track-ui-edits.sh — delegates to node helper.
exec node "${CLAUDE_PROJECT_DIR}/.claude/hooks/track-ui-edits.mjs"
