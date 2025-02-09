# Step 1: Base image for building
FROM node:22-bullseye-slim AS build
# Step 2: Set working directory
WORKDIR /app
# Step 3: Install dependencies for pnpm
RUN npm install -g pnpm@10.2.1  # Ensure a specific version of pnpm
# Step 4: Copy application files
COPY .npmrc ./
COPY .nuxtignore ./
COPY package*.json ./
COPY pnpm-*.yaml ./
COPY *.config.ts ./
COPY tsconfig.json ./
COPY package.json package.json
COPY . .
# Step 5: Clean up old node_modules (if any) and install dependencies
RUN rm -rf node_modules && pnpm install
# Step 6: Build the application
RUN pnpm build
# Step 7: Use a smaller image for production
FROM node:22-bullseye-slim AS prod
# Step 8: Set working directory
WORKDIR /app
# Step 9: Install required packages (curl needed for AWS CLI)
RUN apt-get update && apt-get install -y curl unzip
# Step 10: Install pnpm (again) to ensure it's available in the production environment
RUN npm install -g pnpm@10.2.1  # Ensure the same version of pnpm
# Step 11: Copy built application from build stage
COPY --from=build /app /app
# Step 12: Remove unnecessary dev dependencies
RUN pnpm install
# Step 13: Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws
# Step 14: Expose port 3000
EXPOSE 3000
# Step 15: Push output files to S3 before starting the application
CMD aws s3 sync /app/.output s3://$AWS_S3_BUCKET
# Step 16: Start the application
CMD ["pnpm", "start"]
