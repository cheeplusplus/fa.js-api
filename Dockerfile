## Build ##
FROM node:hydrogen-alpine AS builder

WORKDIR /usr/src/build

# Install packages
COPY package.json .
COPY package-lock.json .
RUN npm install

# Build
COPY . .
RUN npm run build

# Switch to prod packages
RUN npm install --only=production

## Runtime ##
FROM node:hydrogen-alpine AS runtime

WORKDIR /usr/src/app

COPY --from=builder /usr/src/build .

# Runtime
EXPOSE 3000
CMD ["npm", "run", "start"]
