#!/bin/bash
# ----------------------------------------------------------------------------------------------------------------------
# This script is intended to contain all actions pertaining to code style checking, linting and normalisation.
#
# 1. The script executes linting routines on specific folders.
# 2. If arguments are passed, it treats them as file references and auto formats them before linting.
# ----------------------------------------------------------------------------------------------------------------------

# Stop on first error
set -e;

FILES_TO_TEST="test/ index.js lib/ scripts/";

# banner
echo -e "\033[93mLinting and style-checking...\033[0m";
echo -en "\033[0m\033[2m";
echo -e "eslint `eslint -v`\033[0m\n";

# run static linter
echo;
eslint $FILES_TO_TEST;
echo -en "No lint errors found.\n";
