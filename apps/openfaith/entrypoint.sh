#!/bin/bash
set -e

# This script is used to inject runtime environment variables into the
# static frontend assets. Vite builds the application with placeholder
# values, and this script replaces them with the actual values from the
# environment before starting the server.

# Default to the correct output directory for the @openfaith/openfaith package
PUBLIC_DIR="${PUBLIC_DIR:-/usr/src/app/apps/openfaith/.output/public}"

if [ ! -d "$PUBLIC_DIR" ]; then
  echo "Error: Public directory not found at $PUBLIC_DIR"
  exit 1
fi

# Find all Javascript and CSS files in the public directory
FILES=$(find "$PUBLIC_DIR" -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \))

if [ -z "$FILES" ]; then
  echo "Warning: No JS, CSS, or HTML files found to process in $PUBLIC_DIR"
else
  echo "Replacing environment variables in the following files:"
  echo "$FILES"
  # Use a different delimiter for sed to handle URLs gracefully
  for FILE in $FILES
  do
    sed -i "s|__VITE_ZERO_SERVER__|$VITE_ZERO_SERVER|g" "$FILE"
    sed -i "s|__VITE_APP_NAME__|$VITE_APP_NAME|g" "$FILE"
    sed -i "s|__VITE_BASE_URL__|$VITE_BASE_URL|g" "$FILE"
    sed -i "s|__VITE_PROD_ROOT_DOMAIN__|$VITE_PROD_ROOT_DOMAIN|g" "$FILE"
    sed -i "s|__VITE_PROD_EMAIL_DOMAIN__|$VITE_PROD_EMAIL_DOMAIN|g" "$FILE"
    sed -i "s|__VITE_PLANNING_CENTER_CLIENT_ID__|$VITE_PLANNING_CENTER_CLIENT_ID|g" "$FILE"
  done
  echo "Replacement complete."
fi

# Execute the original command passed to the script
exec "$@"
