# Use the official Node.js image as a base
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for installing dependencies
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# On start: apply DB migrations + seed baseline data, then start Next.js.
# (See docker-entrypoint.sh. drizzle-kit / tsx are present because `npm install`
# above installs devDependencies too.)
CMD [ "sh", "docker-entrypoint.sh" ]