#!/usr/bin/env bash
# post-edit-typecheck.sh — delegates to node helper.
exec node "${CLAUDE_PROJECT_DIR}/.claude/hooks/post-edit-typecheck.mjs"
