FROM node:20-alpine

WORKDIR /app

# Install package dependencies
COPY package*.json ./
RUN npm install

# Copy frontend application files
COPY . .

EXPOSE 5173

# Command to run local Vite development server with host binding to expose port
CMD ["npm", "run", "dev", "--", "--host"]
