#!/bin/bash
# should be started from project dirictory
mkdir -p build
file_name=(${1//./ })   
result=`ligo compile contract  "smart-contracts/$1" > "build/${file_name[0]}.tz"`
