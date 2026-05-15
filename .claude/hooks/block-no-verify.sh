#!/usr/bin/env bash
# block-no-verify.sh — delegates to node helper so we don't depend on jq.
exec node "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-no-verify.mjs"
