#!/bin/bash
# ----------------------------------------------------------------------------------------------------------------------
# This script is intended to generate schema of this module
# ----------------------------------------------------------------------------------------------------------------------

# Stop on first error
set -e;

echo -e "\033[93mGenerating schema...\033[0m";

OUTPUT_FOLDER="./out/schema";
OUTPUT_FILE="$OUTPUT_FOLDER/collection.json"

# clean directory
[ -d "$OUTPUT_FOLDER" ] && [ -f "$OUTPUT_FILE" ] && rm -f "$OUTPUT_FILE";
mkdir -p "$OUTPUT_FOLDER";

json-schema-compiler --dir "lib/schema" --root "lib/schema/collection.json" --output "$OUTPUT_FILE";

echo " - schema can be found at $OUTPUT_FILE";
