# Build: bundle de produção do Vite
FROM node:24-alpine AS build

WORKDIR /build

COPY app/frontend/package.json app/frontend/package-lock.json ./
RUN npm ci

COPY app/frontend ./

# SHA do commit deployado (o Coolify injeta via SOURCE_COMMIT); vira env que o
# vite.config lê pra montar "v<semver> (<sha>)". Sem git dentro da imagem.
ARG SOURCE_COMMIT=dev
ENV SOURCE_COMMIT=$SOURCE_COMMIT
RUN npm run build

# Runtime: nginx servindo o dist + proxy reverso para o backend
FROM nginx:1.29-alpine

COPY docker/production/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist /build/front/dist

EXPOSE 80
