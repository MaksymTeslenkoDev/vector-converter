#!/bin/bash

# Exit on any error
set -e

LAMBDA_FUNCTION_NAME=$1
ZIP_FILE=$2

# Check if function name and zip file are provided
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Error: Lambda function name and zip file path are required."
  echo "Usage: ./scripts/deployLambda.sh <LAMBDA_FUNCTION_NAME> <ZIP_FILE_PATH>"
  exit 1
fi



# Verify if ZIP_FILE exists
if [ ! -f "$ZIP_FILE" ]; then
  echo "Error: Zip file '$ZIP_FILE' does not exist."
  exit 1
fi

# Deploy the zip file to AWS Lambda
echo "Deploying Lambda function '$LAMBDA_FUNCTION_NAME' to AWS..."
aws lambda update-function-code \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --zip-file fileb://$ZIP_FILE

echo "Deployment completed successfully for Lambda function: $LAMBDA_FUNCTION_NAME"
