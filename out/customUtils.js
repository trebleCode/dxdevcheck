"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkIsConfigured(name) {
    let isConfigured;
    switch (name) {
        case 'child1':
            isConfigured = checkChild1();
            break;
        case 'child2':
            isConfigured = checkChild2();
            break;
        case 'child1':
            isConfigured = checkChild3();
            break;
        case 'child1':
            isConfigured = checkChild4();
            break;
    }
    return isConfigured;
}
exports.checkIsConfigured = checkIsConfigured;
function checkChild1() {
    return true;
}
exports.checkChild1 = checkChild1;
function checkChild2() {
    return false;
}
exports.checkChild2 = checkChild2;
function checkChild3() {
    return true;
}
exports.checkChild3 = checkChild3;
function checkChild4() {
    return false;
}
exports.checkChild4 = checkChild4;
//# sourceMappingURL=customUtils.js.map