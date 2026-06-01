#!/bin/bash
# deploy.sh — stage and commit all changes with a message
# Usage: ./deploy.sh "Your commit message"
MSG="${1:-Update website}"
cd "$(dirname "$0")"
git add -A
git commit -m "$MSG"
