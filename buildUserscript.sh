substr_between() {
  printf '%s' "$1" | grep -oP "(?<=${2:-''}).*?(?=${3:-"$2"})"
}

str_escape() {
  for (( i=0; i<${#1}; i++ )); do local str="$str\\${1:$i:1}"; done
  printf '%s' "$str"
}

main() {
  local _OPEN_TAG='/*%% '
  local _CLOSE_TAG=' %%*/'
  # store initial working dir (to restore it later) and switch to target script dir
  local _PWD="$PWD"
  cd "$1" || return 1
  # generate output filename from parent dir name
  local _OUTPUT_FILE="../$(basename "$PWD").js"
  # build output file
  while IFS='' read -r _LINE; do
    # check whether current line contains an insertion tag and get its content, if so
    _INCLUDE_PATH=$(substr_between "$_LINE" "$(str_escape "$_OPEN_TAG")" "$(str_escape "$_CLOSE_TAG")")
    if [ -n "$_INCLUDE_PATH" ]; then
      # replace insertion tag with the corresponding file content
      _CONTENT=$(cat "$_INCLUDE_PATH")
      _PLACEHOLDER="${_OPEN_TAG}${_INCLUDE_PATH}${_CLOSE_TAG}"
      _LINE="${_LINE//"${_PLACEHOLDER}"/"$_CONTENT"}"
    fi
    # append current line to output file
    echo "$_LINE"
  done < "$2" > "${_OUTPUT_FILE}"
  # restore initial dir and finish task
  cd "$_PWD" || return 1
  return 0
}

main "$@"
