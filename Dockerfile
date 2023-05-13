FROM node:lts-alpine AS builder
WORKDIR /mm-auth-app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:lts-alpine AS runner
WORKDIR /mm-auth-app
COPY --from=builder /mm-auth-app/dist ./dist
COPY --from=builder /mm-auth-app/package*.json ./
COPY --from=builder /mm-auth-app/node_modules ./node_modules
COPY --from=builder /mm-auth-app/tsconfig.json ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]