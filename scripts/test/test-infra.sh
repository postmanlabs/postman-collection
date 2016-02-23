#!/bin/bash
# ----------------------------------------------------------------------------------------------------------------------
# This script is intended to execute all infrastructure tests.
# ----------------------------------------------------------------------------------------------------------------------

# stop on first error
set -e;

echo -e "\n\n\033[93mRunning infrastructure tests...\033[0m";
echo -e "\033[0m\033[2mmocha `mocha --version`\033[0m\n";

# run mocha tests
mocha test/infra/**/*.test.js --recursive;
