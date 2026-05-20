# Stage 1: Build the React TypeScript application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Run production build compilation
RUN npm run build

# Stage 2: Serve static files with optimized Nginx
FROM nginx:alpine

# Copy compilation output from build stage to Nginx default folder
COPY --from=build /app/dist /usr/share/nginx/html

# Replace standard default configurations with our custom routing configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
