#!/bin/bash
# ----------------------------------------------------------------------------------------------------------------------
# This script is intended to generate wiki of this module
# ----------------------------------------------------------------------------------------------------------------------

# Stop on first error
set -e;

echo -e "\033[93mGenerating wiki...\033[0m";
echo -e "\033[0m\033[2mjsdoc2md\033[0m\n";

# some variables
OUT_DIR="out/wiki";
OUT_FILE="REFERENCE.md";
OUT_PATH="$OUT_DIR/$OUT_FILE";

# clean directory
[ -d "$OUT_DIR" ] && rm -rf "$OUT_DIR";
mkdir -p "$OUT_DIR";

# execute command
jsdoc2md --src lib/**/*.js > $OUT_PATH;

echo " - wiki generated at $OUT_PATH\n";
