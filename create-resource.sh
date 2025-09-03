#!/bin/bash

if [ -z "$1" ]; then
  echo "Uso: ./create-resource.sh nome-do-resource"
  exit 1
fi

RESOURCE_NAME=$1
RESOURCE_PATH="resources/$RESOURCE_NAME"

nest g resource $RESOURCE_PATH

echo "Resource '$RESOURCE_NAME' criado em src/$RESOURCE_PATH"
