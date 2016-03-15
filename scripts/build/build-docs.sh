#!/bin/bash
# ----------------------------------------------------------------------------------------------------------------------
# This script is intended to generate documentation of this module
# ----------------------------------------------------------------------------------------------------------------------

# Stop on first error
set -e;

echo -e "\033[93mGenerating documentation...\033[0m";

# clean directory
[ -d ./out/docs ] && rm -rf ./out/docs;

jsdoc -c .jsdoc-config.json lib/*;
echo " - documentation can be found at ./out/docs";
