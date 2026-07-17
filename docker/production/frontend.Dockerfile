# Build: bundle de produção do Vite
FROM node:24-alpine AS build

WORKDIR /build

COPY app/frontend/package.json app/frontend/package-lock.json ./
RUN npm ci

COPY app/frontend ./
RUN npm run build

# Runtime: nginx servindo o dist + proxy reverso para o backend
FROM nginx:1.29-alpine

COPY docker/production/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist /build/front/dist

EXPOSE 80
