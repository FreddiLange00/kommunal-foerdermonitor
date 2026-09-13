FROM node:24-alpine
RUN mkdir /state && chown node:node /state
WORKDIR /app
COPY runner.mjs healthcheck.mjs ./
USER node
HEALTHCHECK --interval=60s --timeout=5s --retries=3 CMD ["node","healthcheck.mjs"]
CMD ["node","runner.mjs"]
