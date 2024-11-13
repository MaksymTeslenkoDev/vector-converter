FROM public.ecr.aws/lambda/nodejs:latest-x86_64

COPY dist ${LAMBDA_TASK_ROOT}

# Use nodemon to start the handler and watch for changes
CMD ["lambda/index.handler"]
