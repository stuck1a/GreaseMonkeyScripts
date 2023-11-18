#
# Deployment script for building complex GreaseMonkey userscripts.
#
# USAGE:
# ./buildUserscript.sh 'relative/path/to/basefile' 'name_of_basefile' 'relative/output/path'
# 
# DESCRIPTION:
# Allows to split your userscript in several smaller files in which
# you can insert block-based commands.
# The script will be parsed and all recognized tags will be processed
# resulting in a single script file usable as GreaseMonkey userscript.
#
# At the moment there are two predefined core functions by default:
# (1) Merge-Blocks: 
# Use /*%% PATH %%*/ anywhere in your script. This block will be
# replaced by content of the file specified as PATH. These sub files
# might contain another merge blocks as well.
# PATH must be relative to your base file.
#
# (2) Skip-Blocks:
# Use /*<SKIP>foo bar<SKIP>*/ to define a section which will be
# omitted when the output file is created.
# 
# You can define additional rules in the config file.
# To do so, you must specify the open tag, the close tag and
# the name of the function, which will process the block.
# Then add the specified function to this file.
#
# NOTE:
# Even if this script was written as deployment system for java scripts,
# its basically not limited to it. Therefore, you can not just merge *.js files
# but any plaint text file like style sheets, html pages, text files or
# whatever you want to merge into your base file.
# Also works under WSL.
#

#######################################################################################
###                                    UTILITIES                                    ###
#######################################################################################

substr_between() {
  printf '%s' "${1}" | grep -oP "(?<=${2:-''}).*?(?=${3:-"${2}"})"
}


str_escape() {
  local str
  for (( i=0; i<${#1}; i++ )); do
    str="${str}\\${1:${i}:1}"
  done
  printf '%s' "${str}"
}


## Create empty files given as arguments. Folders are created as necessary on-the-fly.
## @param ...$1  - Files to creates
## @return {boolean}
mktouch() {
  if [ $# -lt 1 ]; then
    echo 'mktouch: Missing argument.'
    return 1
  fi
  for f in "${@}"; do
    mkdir -p -- "$(dirname -- "${f}")"
    touch -- "${f}"
  done
}



#######################################################################################
###                                    FUNCTIONS                                    ###
#######################################################################################


## Function to process operation 'skip'
## @param $1  - output file
## @param $2  - skip block open tag
## @param $3  - skip block close tag
skip_blocks() {
  return 0
}



## Function to process operation 'merge'
## @param $2  - merge block open tag
## @param $3  - merge block close tag
merge_blocks() {
  local output
  local tmp
  # Replace function for the recursion
  replace_blocks() {
    local include_path
    local content
    local placeholder
    local line
    # build output file
    while IFS='' read -r line; do
      # search for a merge tag in current line
      include_path="$(substr_between "${line}" "$(str_escape "${open_tag}")" "$(str_escape "${close_tag}")")"
      if [ -n "${include_path}" ]; then
        # replace tag with the content of the file the tag points to
        content="$(cat "${include_path}")"
        placeholder="${open_tag}${include_path}${close_tag}"
        line="${line//"${placeholder}"/"${content}"}"
      fi
      # append current line to collected output
      echo "${line}"
    done < "${output_file}"
  }
  while : ; do
    # read current content of the output file and replace all blocks with their actual content
    output="$(replace_blocks "${output_file}" "${open_tag}" "${close_tag}")"
    # write new content to the output file
    echo "${output}" > "${output_file}"
    # search for next merge tag
    tmp="$(substr_between "${output}" "$(str_escape "${open_tag}")" "$(str_escape "${close_tag}")")"
    # stop recursion output file contains no more blocks
    if [ -z "${tmp}" ]; then break; fi
  done
}



## Executes all configured block rules
## @param $1  - Absolute path to the output file
process_rules() {
  local open_tag
  local close_tag
  
  # merge blocks
  open_tag='/*%% '
  close_tag=' %%*/'
  merge_blocks
  
  # skip blocks
  open_tag='/*<SKIP>'
  close_tag='<SKIP>*/'
  skip_blocks  
}



## Entry point
## @param $1  - Relative path to base file
## @param $2  - Relative path to output file
main() {
  # store initial dir (to restore it later) and change to the directory with the base file
  local _pwd="${PWD}"
  cd "$(dirname "${1}")" || return 1
  # generate absolute path to the output file and copy content of the base file to it
  local output_file="${_pwd}/${2}"
  base_filename=$(basename "${1}")
  mktouch "${output_file}"
  cat "${base_filename}" > "${output_file}"
  # process blocks
  process_rules "${output_file}"
  # restore initial dir and finish task
  cd "${_pwd}" || return 1
}



#######################################################################################
###                                    EXECUTION                                    ###
#######################################################################################

main "${@}"

# cls && wsl ./buildUserscript.sh 'src/NuoFlix/EnhancedNuoFlix' 'base.js' 'dist/NuoFlix/EnhancedNuoFlix/EnhancedNuoFlix.js'
# cls && wsl ./buildUserscript.sh 'src/FooPage/FooUserscript/base.txt' 'src/FooPage/FooUserscript/generatedResult.txt'

