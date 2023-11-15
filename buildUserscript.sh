#!/bin/bash


main() {
  # store initial working dir (to restore it later) and switch to target script dir
  _PWD="$PWD"
  cd "$1" || return 1
  
  # Generate output filename from parent dir name
  _OUTPUT_FILE="../$(basename "$PWD").js"
  
  # Create the output file with the template as base
  cat "$2" > "$_OUTPUT_FILE"
  
  
  # restore initial dir
  cd "$_PWD" || return 1
}
main "$1"


# Prompt
# mergeTest/EnhancedNuoFlix _template.js




# CMD
# cd "C:/xampp/htdocs/projects/GreaseMonkeyScripts"
# sh buildUserscript.sh "mergeTest/EnhancedNuoFlix" "_template.js"
