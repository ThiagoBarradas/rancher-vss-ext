#!\bin\bash

# Clean
rm -rf dist

# Copy files
mkdir -p dist
cp -r {src,images} dist
cp {*.json,*.md} dist

# Setup Version
grep -rl "#{version_major}#" dist | xargs sed -i 's/#{version_major}#/'$1'/g'
grep -rl "#{version_minor}#" dist | xargs sed -i 's/#{version_minor}#/'$2'/g'
grep -rl "#{version_patch}#" dist | xargs sed -i 's/#{version_patch}#/'$3'/g'

# Install Dependencies
cd dist
npm install 

# Compile Typescript
tsc 

# Create Artifact
tfx extension create