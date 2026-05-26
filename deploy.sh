#!/bin/bash
# deploy.sh — manually commit and deploy to Netlify
# Usage: ./deploy.sh "Your commit message"
MSG="${1:-Update website}"
cd "$(dirname "$0")"
git add -A
git commit -m "$MSG"
# post-commit hook handles the Netlify deploy automatically
