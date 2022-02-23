#!/bin/bash
# should be started from project dirictory
mkdir -p build
ligo compile contract  "smart-contracts/$1" > "build/$2"
echo "Smart contract was compiled into \"build/\" folder"