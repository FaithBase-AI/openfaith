const fs = require('fs');
const path = './backend/server/live/externalLinkManagerLive.ts';

let content = fs.readFileSync(path, 'utf8');

// Add cause and message to all ExternalLinkNotFoundError instances that don't have them
content = content.replace(
  /new ExternalLinkNotFoundError\(\{\s*entityId: ([^,]+),\s*entityType: ([^,]+),\s*\}\)/g,
  `new ExternalLinkNotFoundError({
                entityId: $1,
                entityType: $2,
                cause: error,
                message: \`Failed operation: \${error}\`,
              })`
);

// Add cause and message to all ExternalLinkConflictError instances that don't have them
content = content.replace(
  /new ExternalLinkConflictError\(\{\s*([^}]+)\s*\}\)/g,
  (match, props) => {
    if (props.includes('cause:')) return match; // Already has cause
    return `new ExternalLinkConflictError({
                ${props},
                cause: error,
                message: \`Failed operation: \${error}\`,
              })`;
  }
);

fs.writeFileSync(path, content);
console.log('Updated error mappings');
