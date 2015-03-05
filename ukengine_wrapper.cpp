#include <stdio.h>
#include "ibus-unikey/ukengine/unikey.h" 
#include "ibus-unikey/ukengine/keycons.h" 
#include <emscripten/bind.h>

int getUnikeyBackspaces() { return UnikeyBackspaces;}
int getUnikeyBufChars() { return UnikeyBufChars;}
int getUnikeyBuf() { return (int)&UnikeyBuf[0];}


int main() {
    UnikeySetup();
    return 0;
}

EMSCRIPTEN_BINDINGS(unikey) {
    emscripten::function("UnikeySetup", &UnikeySetup);
    emscripten::function("UnikeySetInputMethod", &UnikeySetInputMethod);
    emscripten::function("UnikeyCleanup", &UnikeyCleanup);
    emscripten::function("UnikeyPutChar", &UnikeyPutChar);
    emscripten::function("UnikeyResetBuf", &UnikeyResetBuf);
    emscripten::function("UnikeyBackspacePress", &UnikeyBackspacePress);
    emscripten::function("UnikeySetCapsState", &UnikeySetCapsState);
    emscripten::function("UnikeySetSingleMode", &UnikeySetSingleMode);
    emscripten::function("UnikeyRestoreKeyStrokes", &UnikeyRestoreKeyStrokes);
    emscripten::function("getUnikeyBuf", &getUnikeyBuf);
    emscripten::function("UnikeyFilter", &UnikeyFilter);
    emscripten::function("getUnikeyBackspaces", &getUnikeyBackspaces);
    emscripten::function("getUnikeyBufChars", &getUnikeyBufChars);

    emscripten::enum_<UkInputMethod>("UkInputMethod")
             .value("UkTelex", UkTelex)
             .value("UkVni", UkVni)
             .value("UkViqr", UkViqr);
};


