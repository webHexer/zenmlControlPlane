FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy full code
COPY . .

# Build TypeScript (if using TS)
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]