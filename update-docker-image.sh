#!/bin/bash
# Set default environment to "dev"
environment="dev"
echo "Updating $environment docker image"
# Check if an environment argument is provided
if [ -n "$1" ]; then
  environment="$1"
fi

# Find image and container ID
image_id=$(sudo docker images -q "server:$environment")
container_id=$(sudo docker ps -aq --filter "ancestor=$image_id")

# Build the new image
sudo docker build -t "server-$environment" -f "Dockerfile.$environment.update" .

# Stop and remove containers, delete the image
if [ -n "$container_id" ]; then
  echo "Stopping and removing existing containers..."
  sudo docker stop $container_id
  sudo docker rm $container_id
fi

if [ -n "$image_id" ]; then
  echo "Deleting existing image..."
  sudo docker rmi $image_id
fi
