FROM node:18-slim

# Define build arguments for all required environment variables
ARG NODE_ENV
ARG DATABASE_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG CMC_API_KEY
ARG REDIS_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_EXCHANGE_API_URL
ARG NEXT_PUBLIC_EXCHANGE_PAGE_URL
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_DOMAIN

# Set these as environment variables to be available during build and runtime
ENV NODE_ENV=${NODE_ENV}
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV CMC_API_KEY=${CMC_API_KEY}
ENV REDIS_URL=${REDIS_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_EXCHANGE_API_URL=${NEXT_PUBLIC_EXCHANGE_API_URL}
ENV NEXT_PUBLIC_EXCHANGE_PAGE_URL=${NEXT_PUBLIC_EXCHANGE_PAGE_URL}
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}
ENV NEXT_PUBLIC_DOMAIN=${NEXT_PUBLIC_DOMAIN}

# Set working directory
WORKDIR /app

# Install system dependencies including Python, cron, and utilities
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv cron procps screen nano && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Print all environment variables during build
RUN env | sort

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Print environment variables again after application code is copied
RUN echo "Environment variables after application code is copied:" && env | sort

# Setup logs directory
RUN mkdir -p /app/logs

# Set up Python virtual environment
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"
ENV VIRTUAL_ENV="/venv"

# Install Python dependencies
RUN if [ -f scripts/requirements.txt ]; then \
        echo "Using existing requirements.txt" && \
        pip install -r scripts/requirements.txt; \
    else \
        echo "Creating default requirements.txt" && \
        echo -e "twikit\nredis\npython-dotenv\nrequests" > /tmp/requirements.txt && \
        pip install -r /tmp/requirements.txt; \
    fi

# run npm install of scripts/package.json
RUN cd scripts && npm install && cd ..

# Make scripts executable
RUN chmod +x /app/start.sh || echo "start.sh not found" && \
    chmod +x /app/view-logs.sh || echo "view-logs.sh not found"

# Build the application
RUN npm run build

# Set up the entrypoint script
RUN echo '#!/bin/bash' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo 'echo "Starting container at $(date)"' >> /app/docker-entrypoint.sh && \
    echo '# Run setup script for cron jobs' >> /app/docker-entrypoint.sh && \
    echo '/app/start.sh' >> /app/docker-entrypoint.sh && \
    echo '# Start Node.js application' >> /app/docker-entrypoint.sh && \
    echo 'exec npm start >> /app/logs/app.log 2>> /app/logs/app-error.log' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Expose the port that your application runs on
EXPOSE 3000

# Set the entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
