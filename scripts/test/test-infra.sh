#!/bin/bash
# ----------------------------------------------------------------------------------------------------------------------
# This script is intended to execute all infrastructure tests.
# ----------------------------------------------------------------------------------------------------------------------

# stop on first error
set -e;

# some variables
FAKE_NSP_PATH=".tmp/nsp";

echo -e "\n\n\033[93mRunning infrastructure tests...\033[0m";
echo -e "\033[0m\033[2mmocha `mocha --version`\033[0m";
echo -e "\033[0m\033[2mpackity `packity --version`\033[0m";
echo -e "\033[0m\033[2mnsp `nsp -v`\033[0m\n";

# run packity
packity check .

# run mocha tests
mocha test/infra/**/*.test.js --recursive;

# do node security check
echo -e "\nnsp...";
[ -d "$FAKE_NSP_PATH" ] && rm -rf "$FAKE_NSP_PATH";
mkdir -p "$FAKE_NSP_PATH";
./scripts/test/fake_nsp_package.js > "$FAKE_NSP_PATH/package.json";

pushd "$FAKE_NSP_PATH" &>/dev/null
nsp check;
popd &>/dev/null
