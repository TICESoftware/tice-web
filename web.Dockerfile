FROM node:lts-alpine as build-stage
WORKDIR /app
RUN apk add --no-cache git

COPY package.json yarn.lock ./
RUN yarn install --no-cache --frozen-lockfile
COPY . .
RUN yarn run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
RUN echo "server { listen 80; listen [::]:80; server_name localhost; root /usr/share/nginx/html; index index.html; location ~* apple-app-site-association$ { try_files /apple-app-site-association $uri =404; default_type application/json; } location / { try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
