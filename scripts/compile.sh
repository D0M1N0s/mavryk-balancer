#!/bin/bash
# should be started from project dirictory
mkdir -p build
ligo compile contract  "smart-contracts/$1" > "build/$2"