# Copy and customize this template in your own application project.
# Expected inputs there: package.json, reviewed lockfile, and app/server.js.
FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --chown=node:node app/ ./
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
USER node
EXPOSE 8080
CMD ["node", "server.js"]
