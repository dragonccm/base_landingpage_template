FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY workflow-registry.json ./workflow-registry.json
COPY project-profiles ./project-profiles
COPY .env.example ./.env.example
RUN mkdir -p artifacts data
EXPOSE 8787
CMD ["node", "src/index.mjs", "--web"]
