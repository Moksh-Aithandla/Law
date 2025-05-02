FROM node:16-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Create .env file directory
RUN mkdir -p /app/backend

# Expose ports
EXPOSE 3000 8545

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "start"]