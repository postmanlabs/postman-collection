#!/bin/bash
# ----------------------------------------------------------------------------------------------------------------------
# This script is intended to contain all actions pertaining to code style checking, linting and normalisation.
#
# 1. The script executes linting routines on specific folders.
# 2. If arguments are passed, it treats them as file references and auto formats them before linting.
# ----------------------------------------------------------------------------------------------------------------------

# Stop on first error
set -e;

FILES_TO_TEST="test/ index.js lib/";

# Run js-beautifier if a file name is passed as argument
if [ $# -gt 0 ]; then
    echo -e "\033[33mjs-beautify v`js-beautify --version;`\033[0m";
    for arg in "$@"; do
        if [ -f "./${arg}" ]; then
            js-beautify -s 2 -c " " -p -m 5 -j -b "end-expand" --good-stuff -r -n --file=./"${arg}";
        else
            echo -e "\033[31m✘ could not locate ./${arg}\033[0m";
        fi
    done
    echo
fi

# banner
echo -e "\033[93mLinting and style-checking...\033[0m";
echo -en "\033[0m\033[2m";
jshint -v;
echo -e "jscs v`jscs --version`\033[0m\n";

# run style checker
jscs $FILES_TO_TEST;

# run static linter
echo;
jshint $FILES_TO_TEST;
echo -en "No lint errors found.\n";
