#!/bin/bash

# Change directory to lambda folder, build, and save GitHub build number
pushd ./lambda
npm run build
echo $GITHUB_BUILD_NUMBER > dist/build_number.txt
popd
