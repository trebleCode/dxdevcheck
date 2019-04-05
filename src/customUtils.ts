export function checkIsConfigured(name: string): boolean {
     let isConfigured: boolean;
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

export function checkChild1() {
    return true;
}

export function checkChild2() {
    return false;
}

export function checkChild3() {
    return true;
}

export function checkChild4() {
    return false;
}