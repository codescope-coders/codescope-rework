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

# Cloudflare Turnstile's SITE key (public, not a secret — it is visible in the
# page source by design).
#
# It has to be here rather than in docker-compose because Next.js INLINES
# NEXT_PUBLIC_* into the browser bundle at BUILD time. Measured on this repo:
# built with the value present, the client chunk contains the literal string;
# built without it, the same chunk falls back to a browser `process` polyfill
# whose `env` is `{}` — so the widget can never render, no matter what the
# running container's environment says.
#
# `ENV` re-exports it so the SERVER (which does read this one at runtime) sees
# exactly what the client bundle was built with. That agreement is what makes
# lib/turnstile.ts's "both halves or neither" gate safe: the two can never
# disagree, so there is no state where the server demands a token from a page
# that has no widget to produce one. For the same reason the site key is
# deliberately NOT listed in docker-compose.prod.yml — see the note there.
#
# Unset, this is the empty string and Turnstile stays off, which is exactly the
# behaviour before it existed.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# On start: apply DB migrations + seed baseline data, then start Next.js.
# (See docker-entrypoint.sh. drizzle-kit / tsx are present because `npm install`
# above installs devDependencies too.)
CMD [ "sh", "docker-entrypoint.sh" ]