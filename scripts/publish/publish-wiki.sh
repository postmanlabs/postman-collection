#!/usr/bin/env bash
# ----------------------------------------------------------------------------------------------------------------------
# This script is intended to publish wiki of this module
# ----------------------------------------------------------------------------------------------------------------------

# Stop on first error
set -e;
echo -e "\033[93mPublishing wiki...\033[0m";

OUT_DIR="out/wiki";
WIKI_URL="https://github.com/postmanlabs/postman-collection.wiki.git";
WIKI_GIT_PATH=".tmp/github-wiki";
WIKI_VERSION="$(git describe --always)";
SRC_FILE="REFERENCE.md";
SRC_PATH="$OUT_DIR/$OUT_FILE";

# function to be called on exit
# and ensure cleanup is called before the script exits
SWD="$PWD";
function cleanup {
  cd "$SWD" &>/dev/null; # switch to starting work directory

  if [ "$?" != "0" ]; then
    echo -e "\033[31m\nWiki publish failed!\033\n";
    exit 1;
  fi
}
trap cleanup EXIT;

# build the reference MD
npm run build-wiki;

# clone repository
mkdir -p "$WIKI_GIT_PATH";
rm -rf "$WIKI_GIT_PATH";
git clone "$WIKI_URL" "$WIKI_GIT_PATH" --quiet;

# update contents of repository
./scripts/publish/wiki_create_content_from_reference.js

pushd "$WIKI_GIT_PATH" &>/dev/null;
git add --all 1>/dev/null;
git commit -m "[auto] $WIKI_VERSION" 1>/dev/null;
git push origin master 1>/dev/null;
popd &>/dev/null;

echo " - wiki published $WIKI_VERSION";