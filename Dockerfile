FROM node:22-alpine AS build
WORKDIR /app
# Keep the build heap bounded for Raspberry Pi hosts with limited RAM.
ENV NODE_OPTIONS="--max-old-space-size=640"
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
