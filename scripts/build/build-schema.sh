#!/bin/bash
# ----------------------------------------------------------------------------------------------------------------------
# This script is intended to generate schema of this module
# ----------------------------------------------------------------------------------------------------------------------

# Stop on first error
set -e;

echo -e "\033[93mGenerating schema...\033[0m";

# clean directory
[ -d ./out/schema ] && rm -rf ./out/schema;

echo " - schema can be found at ./out/schema";
