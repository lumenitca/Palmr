#!/bin/bash

export LC_ALL=C

generate_password() {
  cat /dev/urandom | LC_ALL=C tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1 
}

generate_minio_user() {
  local words=("alpha" "beta" "gamma" "delta" "omega" "light" "dark" "space" "star" "fire" "sky" "moon" "earth" "storm" "wave" "sun" "cloud" "wind" "rain" "shadow" "flame")
  local word1="${words[$RANDOM % ${#words[@]}]}"
  local word2="${words[$RANDOM % ${#words[@]}]}"
  printf "%s_%s" "$word1" "$word2"
}

MINIO_ROOT_USER=$(generate_minio_user)
MINIO_ROOT_PASSWORD=$(generate_password)
DB_PASSWORD=$(generate_password)

input_file="composes/docker-compose-base.yaml"
output_file="docker-compose.yaml"

# Check if docker-compose.yaml already exists
if [ -f "$output_file" ]; then
    read -p $'\033[1;33mThe file docker-compose.yaml already exists. Do you want to replace it? (y/N) \033[0m' response
    if [[ ! "$response" =~ ^[yY]$ ]]; then
        echo -e "\033[1;31mOperation cancelled.\033[0m"
        exit 1
    fi
fi

sed "s/{{MINIO_ROOT_USER}}/$MINIO_ROOT_USER/g; s/{{MINIO_ROOT_PASSWORD}}/$MINIO_ROOT_PASSWORD/g; s/{{DB_PASSWORD}}/$DB_PASSWORD/g" "$input_file" > "$output_file"


# Print a styled header
echo -e "\n\033[1;34m┌────────────────────────────────────────────┐"
echo -e "│           Generated Credentials            │"
echo -e "└────────────────────────────────────────────┘\033[0m\n"

# Print variables in a table format with colors
echo -e "\033[1;36m Variable Name      │ Value\033[0m"
echo -e "\033[1;36m────────────────────┼───────────────────────\033[0m"
echo -e " MINIO_ROOT_USER    │ \033[1;33m$MINIO_ROOT_USER\033[0m"
echo -e " MINIO_ROOT_PASSWORD│ \033[1;33m$MINIO_ROOT_PASSWORD\033[0m"
echo -e " DB_PASSWORD        │ \033[1;33m$DB_PASSWORD\033[0m"
echo

echo -e "\033[1;32m✔ docker-compose.yaml file generated successfully.\033[0m\n"
