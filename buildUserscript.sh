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
#
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


## Prepend a backslash to all given characters
## @param $1  - String to escape
## @param $2  - All characters to escape (case-sensitive)
## @example str_escape_given '<F*OO*~B#AR>' '*~#' outputs <F\*OO\*\~B\#AR>
str_escape_given() {
  for (( i=0; i<${#1}; i++ )); do
    hit=0
    for (( j=0; j<${#2}; j++ )); do
      if [[ "${1:${i}:1}" == "${2:${j}:1}" ]]; then  
        hit=1
        break
      fi
    done
    if [[ "${hit}" == 1 ]]; then
      str="${str}\\${1:${i}:1}"
    else
      str=${str}"${1:${i}:1}"
    fi
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


read_configs() {
  while IFS=$'\n' read -a line; do
    configs+=("${line}")
  done < "${config_file}"
}



#######################################################################################
###                                PROCESS FUNCTIONS                                ###
#######################################################################################

## Function to process operation 'merge'
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


## Function to process operation 'skipBlocks'
remove_skip_blocks() {
  open_tag="$(str_escape_given "${open_tag}" '*')"
  close_tag="$(str_escape_given "${close_tag}" '*')"
  local result="$(perl -0777 -pe "s{\R?${open_tag}.*?${close_tag}}{}sg" "${output_file}")"
  echo "${result}" > "${output_file}"
  return 0
}


## Function to process operation 'lineComments'
remove_line_comments() {
  # FIXME: insert configured arguments
  #open_tag="$(str_escape "${open_tag}")"
  sed -i '22,$s/\/\/[^*].*/ /' "${output_file}"
  return 0
}


## Function to process operation 'blockComments'
remove_block_comments() {
  local result="$(perl -0777 -pe "s{\R?${open_tag}.*?${close_tag}}{}sg" "${output_file}")"
  echo "${result}" > "${output_file}"
  return 0
}


## Function to process operation 'docComments'
remove_doc_comments() {
  open_tag="$(str_escape_given "${open_tag}" '*')"
  close_tag="$(str_escape_given "${close_tag}" '*')"
  local result="$(perl -0777 -pe "s{\R?${open_tag}.*?${close_tag}}{\n}sg" "${output_file}")"
  echo "${result}" > "${output_file}"
  return 0
}


## Function to process operation 'emptyLines'
remove_blank_lines() {
  sed -i '/^[[:space:]]*$/d' "${output_file}"
  return 0
}


## Function to process operation 'trimSpaces'
trim_spaces() {
  sed -i 's/^[ \t]*//;s/[ \t]*$//' "${output_file}"
  return 0
}



#######################################################################################
###                                 BASIC FUNCTIONS                                 ###
#######################################################################################

## Executes all configured block rules
process_rules() {
  local configs=()
  local isFirstSection=1
  local sectionName
  # transfer config lines into an array
  read_configs
  # declare all variables for each config section and execute the function given under key "fnc"
  for line in "${configs[@]}"; do
    # skip blank lines
    if [[ "${line}" =~ ^[[:space:]]*$ ]]; then
      continue
    # skip comment lines
    elif [[ "${line}" =~ ^[[:space:]]*#.*$ ]]; then
      continue
    # if current line is an key-value-pair
    elif [[ "${line}" =~ ^([^=]+)=(.*)$ ]]; then
      # execute keyname=value to create a variable
      printf -v "${BASH_REMATCH[1]}" '%s' "${BASH_REMATCH[2]}"
    # if current line defines a new section
    elif [[ "${line}" =~ ^\[(.*)\]$ ]]; then
      if [[ "${isFirstSection}" == 0 ]]; then
        # execute the latest section
        if [[ "${enabled}" == 'true' ]]; then
          echo "Now executing: ${sectionName}"
          "${fnc}"
        fi  
      fi
      sectionName="${BASH_REMATCH[1]}"
      isFirstSection=0
    # anything else is invalid
    else
      echo 'buildUserscript.sh: Config file is invalid! Exit.'
      exit 1
    fi
  done
  # finally we have to execute the last section as well
  if [[ "${enabled}" == 'true' ]]; then
    echo "Now executing: ${sectionName}"
    "${fnc}"
  fi  
}


## Entry point
## @param $1  - Relative path to base file
## @param $2  - Relative path to output file
main() {
  # store initial dir (to restore it later) and change to the directory with the base file
  local _pwd="${PWD}"
  cd "$(dirname "${1}")" || return 1
  # store path to configs file
  config_file="${_pwd}/buildUserscript.cfg"
  # generate absolute path to the output file and copy content of the base file to it
  local output_file="${_pwd}/${2}"
  base_filename=$(basename "${1}")
  mktouch "${output_file}"
  cat "${base_filename}" > "${output_file}"
  # process blocks
  process_rules
  # restore initial dir and finish task
  cd "${_pwd}" || return 1
}



#######################################################################################
###                                    EXECUTION                                    ###
#######################################################################################

main "${@}"

##
## WSL example calls
##
## wsl ./buildUserscript.sh src/NuoFlix/EnhancedNuoFlix/base.js dist/NuoFlix/EnhancedNuoFlix/EnhancedNuoFlix.js
## wsl ./buildUserscript.sh src/FooPage/FooUserscript/base.txt dist/FooPage/FooUserscript/generatedResult.txt
##
