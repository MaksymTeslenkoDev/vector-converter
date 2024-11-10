#!/bin/bash

# Exit on any error
set -e

LAMBDA_FUNCTION_NAME=$1
DIST_FOLDER=$2
ZIP_FILE="function.zip"

# Check if function name and dist folder are provided
if [ -z "$LAMBDA_FUNCTION_NAME" ] || [ -z "$DIST_FOLDER" ]; then
  echo "Error: Lambda function name and dist folder path are required."
  echo "Usage: ./scripts/deployLambda.sh <LAMBDA_FUNCTION_NAME> <DIST_FOLDER_PATH>"
  exit 1
fi

# Ensure AWS credentials are set (for local testing)
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "Error: AWS credentials are not set."
  exit 1
fi

# Package the Lambda function
echo "Zipping Lambda function from '$DIST_FOLDER'..."
zip -r $ZIP_FILE $DIST_FOLDER/*

# Deploy the zip file to AWS Lambda
echo "Deploying Lambda function '$LAMBDA_FUNCTION_NAME' to AWS..."
aws lambda update-function-code \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --zip-file fileb://$ZIP_FILE

# Clean up zip file after deployment
rm $ZIP_FILE

echo "Deployment completed successfully for Lambda function: $LAMBDA_FUNCTION_NAME"
