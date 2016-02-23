#!/bin/bash
# ----------------------------------------------------------------------------------------------------------------------
# This script is intended to be executed as all-inclusive test and artefact creation (excluding packaging and release.)
# As such, a clean exit from this script implies all tests have passed and the code will not fail a build. (However,
# build may still fail due to errors on build executing servers and as such has no relation with code quality.)
#
# This script executes all non time-bound tests, excluding browser tests and performance tests.
# ----------------------------------------------------------------------------------------------------------------------

# Stop on first error
set -e;

# information block
echo -e "\033[92m   ___     _ _        _   _          \033[93m  ___ ___  _  __ ";
echo -e "\033[92m  / __|___| | |___ __| |_(_)___ _ _  \033[93m / __|   \| |/ / ";
echo -e "\033[92m | (__/ _ \ | / -_) _|  _| / _ \ ' \ \033[93m \__ \ |) | ' <  ";
echo -e "\033[92m  \___\___/_|_\___\__|\__|_\___/_||_|\033[93m |___/___/|_|\_\ ";
echo -e "\033[92m                                                      ";

echo -e "\033[0m\033[2m";
date;
echo "node `node -v`";
echo "npm  v`npm -v`";
which git &>/dev/null && git --version;
echo -e "\033[0m";

# git version
which git &>/dev/null && \
  echo -e "Running on branch: \033[4m`git rev-parse --abbrev-ref HEAD`\033[0m";

# run lint
npm run test-lint;

# run infrastructure unit tests
npm run test-infra;

if [ "$CI" != "true" ]; then
  npm run test-browser
fi

# run unit tests
npm run test-unit;
