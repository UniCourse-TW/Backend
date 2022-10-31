import debug from "debug";

const log = debug("unicourse");

function create_log(namespace: string): debug.Debugger {
    return log.extend(namespace);
}

export { create_log as debug, log };
export default create_log;
