#!/bin/sh

SCRIPT=`readlink $0`
SCRIPTPATH=`dirname $SCRIPT`
#echo $SCRIPTPATH

rm -rf compiled
mkdir compiled
emcc --bind -s DEMANGLE_SUPPORT=1 -funsigned-char ibus-unikey/ukengine/*.cpp ukengine_wrapper.cpp -o src/scripts/ukengine.js
cp -r src/* compiled/
java -jar compiler.jar --js src/scripts/avim.js --js_output_file compiled/scripts/avim.js
java -jar compiler.jar --js src/scripts/background.js --js_output_file compiled/scripts/background.js
java -jar compiler.jar --js src/scripts/popup.js --js_output_file compiled/scripts/popup.js

cd compiled
zip -9 -q -r avim.zip *
cd ..
mv compiled/avim.zip .

