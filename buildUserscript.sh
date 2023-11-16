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

_process_blocks() {
  local _INCLUDE_PATH; local _CONTENT; local _PLACEHOLDER; local _LINE
  # build output file
  while IFS='' read -r _LINE; do
    # check whether current line contains an insertion tag and get its content, if so
    _INCLUDE_PATH="$(substr_between "${_LINE}" "$(str_escape "${_OPEN_TAG}")" "$(str_escape "${_CLOSE_TAG}")")"
    if [ -n "${_INCLUDE_PATH}" ]; then
      # replace insertion tag with the corresponding file content
      _CONTENT="$(cat "${_INCLUDE_PATH}")"
      _PLACEHOLDER="${_OPEN_TAG}${_INCLUDE_PATH}${_CLOSE_TAG}"
      _LINE="${_LINE//"${_PLACEHOLDER}"/"${_CONTENT}"}"
    fi
    # append current line to output file
    echo "${_LINE}"
  done < "${1}"
}

main() {
  local _OUTPUT_FILE_EXTENSION='.js'
  local _OPEN_TAG='/*%% '
  local _CLOSE_TAG=' %%*/'
  local _PWD
  local _OUTPUT_FILE
  local _OUTPUT
  local _TMP
  # store initial working dir (to restore it later) and switch to target script dir
  _PWD="${PWD}"
  cd "${1}" || return 1
  # generate output filename from parent dir name
  _OUTPUT_FILE="../$(basename "${PWD}")${_OUTPUT_FILE_EXTENSION}"
  # generate merged content
  _OUTPUT="$(_process_blocks "${2}")"
  # write content to the output file
  echo "${_OUTPUT}" > "${_OUTPUT_FILE}"
  # recurse merge function until we have no more insertion tags in our content
  while : ; do
    # stop recursion if no more tags found
    _TMP="$(substr_between "${_OUTPUT}" "$(str_escape "${_OPEN_TAG}")" "$(str_escape "${_CLOSE_TAG}")")"
    if [ -z "${_TMP}" ]; then break; fi
    # if we reach this point, another tag was found, so process them
    _OUTPUT="$(_process_blocks "${_OUTPUT_FILE}")"
    # write new content to the output file
    echo "${_OUTPUT}" > "${_OUTPUT_FILE}"
  done
  # restore initial dir and finish task
  cd "${_PWD}" || return 1
  return 0
}

main "${@}"
