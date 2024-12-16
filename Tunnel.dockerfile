# Use the official Node.js 18 Alpine image
FROM node:18-alpine

# Copy all files from the /obfuscator folder to the /app folder
COPY obfuscator/ /app/

# Copy process.json file
COPY process.json /app/process.json

# Set working directory
WORKDIR /app

# Install dependencies
RUN npm install pm2 -g && npm install

# Expose all ports
EXPOSE 1-65535

# Launch PM2 with the specified scripts
CMD ["tail", "-f", "/dev/null"]
# CMD ["pm2-runtime", "start", "process.json"]