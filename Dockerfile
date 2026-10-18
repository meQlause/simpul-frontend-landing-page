FROM node:24.21.0-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
# The film is not in git (public/film is ignored); it is served from Cloud Storage.
ARG VITE_FILM_URL
ENV VITE_FILM_URL=$VITE_FILM_URL
RUN npm run build

FROM nginx:1.29-alpine
ENV PORT=8080
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
