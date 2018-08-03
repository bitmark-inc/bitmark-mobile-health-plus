const StackTrace = require("stacktrace-js");
const SourceMap = require("source-map");
const fs = require("fs");
const SOURCE_MAP_FILE = 'source-map/test/main.jsbundle_1.3.3.map';
const options = {"projectPath": '/Users/dungle/WebstormProjects/mobile-app/', "collapseInLine": true};

let err = new Error('Something went wrong');

// Get and paste error/crash log from error/crash file here
err.stack = `value@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:517:4133
value@[native code]
touchableHandlePress@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:173:1177
touchableHandlePress@[native code]
_performSideEffectsForTransition@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:165:8488
_performSideEffectsForTransition@[native code]
_receiveSignal@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:165:7275
_receiveSignal@[native code]
touchableHandleResponderRelease@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:165:4740
touchableHandleResponderRelease@[native code]
y@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:46:1204
invokeGuardedCallback@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:46:467
invokeGuardedCallbackAndCatchFirstError@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:46:582
H@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:46:2563
D@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:46:3325
forEach@[native code]
F@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:46:3122
Ie@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:46:14792
/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:46:15350
batchedUpdates@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:46:60665
_e@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:46:14565
ze@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:46:15336
receiveTouches@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:46:15879
value@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:18:3471
/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:18:956
value@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:18:2898
value@/var/containers/Bundle/Application/E263F5DB-45B5-4223-B378-9C38A5DCA707/Bitmark dev.app/main.jsbundle:18:928
value@[native code]`;

async function getStackTrace() {
    let minStackTrace = await StackTrace.fromError(err);
    let sourceMapper = await createSourceMapper();

    const stackTrace = minStackTrace.map(row => {
        const mapped = sourceMapper(row);
        const source = mapped.source || "";
        const fileName = options.projectPath ? source.split(options.projectPath).pop() : source;
        const functionName = mapped.name || "unknown";
        return {
            fileName,
            functionName,
            lineNumber: mapped.line,
            columnNumber: mapped.column,
            position: `${functionName}@${fileName}:${mapped.line}:${mapped.column}`
        };
    });
    return options.collapseInLine ? stackTrace.map(i => i.position).join('\n') : stackTrace;
}

const createSourceMapper = async () => {
    const mapContents = fs.readFileSync(SOURCE_MAP_FILE);
    const sourceMaps = JSON.parse(mapContents);
    const mapConsumer = await (new SourceMap.SourceMapConsumer(sourceMaps));

    return sourceMapper = (row) => {
        return mapConsumer.originalPositionFor({
            line: row.lineNumber,
            column: row.columnNumber,
        });
    };
};

async function main() {
    let stackTrace = await getStackTrace();
    console.log('stackTrace:', stackTrace);
}

main();
