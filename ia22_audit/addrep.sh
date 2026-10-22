#!/bin/bash

# Path to the README.md file
README_PATH="README.md"

# Comment and link to be added
COMMENT="## Commentaire"
LINK="http://milyes.github.io/mon-app-pwa"

# Check if the README.md file exists
if [ -f "$README_PATH" ]; then
  # Append the comment and link to the README.md file
  echo -e "\n$COMMENT\n$LINK" >> "$README_PATH"
  echo "Comment and link added to $README_PATH"
else
  echo "README.md file not found!"
fi

# Optionally, commit the changes (uncomment the following lines to use)
# git add "$README_PATH"
# git commit -m "Add comment and directory link to README.md"
# git push origin main
