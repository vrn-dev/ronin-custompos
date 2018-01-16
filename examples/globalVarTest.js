let a = undefined;
let b = undefined;

process.on('SIGINT', () => {

});

function setAB(_a, _b) {
    a = _a;
    b = _b;
}

function unSetAB() {
    a = undefined;
    b = undefined;
}

function start() {
    console.log('a', a);
    console.log('b', b);
    console.log('Setting a b');
    setAB('123', '456');
    console.log('After settings');
    console.log('a', a);
    console.log('b', b);
    console.log('Unsetting');
    unSetAB();
    console.log('After unsetting');
    console.log('a', a);
    console.log('b', b);
}

start();