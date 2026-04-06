#!/bin/bash

# Stop script on any error
set -e

# Define the Docker image and container details
IMAGE_NAME="thunder-bolt"
TAG="latest"
CONTAINER_NAME="thunder-bolt"
PORT="3001"

# Path to Dockerfile directory (assuming it's in the current directory)
DOCKERFILE_DIR="."

# Check if the container is already running
if [ $(docker ps -q -f name=^/${CONTAINER_NAME}$) ]; then
    echo "Container $CONTAINER_NAME is already running. Stopping and removing..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
    echo "Container stopped and removed."
fi

# Check if the image exists and remove it
if [ $(docker images -q ${IMAGE_NAME}:${TAG}) ]; then
    echo "Image $IMAGE_NAME:$TAG already exists. Removing..."
    docker rmi ${IMAGE_NAME}:${TAG}
    echo "Image removed."
fi

# Clean up unused Docker objects
echo "Cleaning up dangling images and build cache older than 12h..."
docker image prune -f --filter "until=12h"
docker builder prune -f --filter "until=12h"
echo "Docker system pruned."

# Build the Docker image
echo "Building Docker image $IMAGE_NAME:$TAG..."
docker build -t ${IMAGE_NAME}:${TAG} $DOCKERFILE_DIR

# Validate build success
if [ $? -eq 0 ]; then
    echo "Image built successfully."
else
    echo "Failed to build Docker image."
    exit 1
fi

# Run the Docker container
echo "Running container $CONTAINER_NAME..."
docker run -d --name $CONTAINER_NAME --network thunder-bolt-network --restart unless-stopped -p ${PORT}:${PORT} ${IMAGE_NAME}:${TAG}

# Validate container is running
if [ $(docker ps -q -f name=^/${CONTAINER_NAME}$) ]; then
    echo "Container is running."
else
    echo "Failed to start Docker container."
    exit 1
fi
