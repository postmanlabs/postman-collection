#!/bin/bash
# ----------------------------------------------------------------------------------------------------------------------
# This script is intended to execute all unit tests in the Chrome Browser.
# ----------------------------------------------------------------------------------------------------------------------

# stop on first error
set -e;

echo -e "\033[93mRunning unit tests within browser...\033[0m";

karma start;
