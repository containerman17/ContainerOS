import { keyable, containerStatusValuesFromDockerEvents } from "../../definitions"

const containerStatusMap: keyable<containerStatusValuesFromDockerEvents> = {
    attach: "not_changed",
    commit: "not_changed",
    copy: "not_changed",
    create: "started",
    destroy: "dead",
    detach: "dead",
    die: "dead",
    exec_create: "not_changed",
    exec_detach: "not_changed",
    exec_start: "not_changed",
    export: "not_changed",
    health_status: "not_changed",
    kill: "dead",
    oom: "dead",
    pause: "dead",
    rename: "not_changed",
    resize: "not_changed",
    restart: "started",
    start: "started",
    stop: "dead",
    top: "not_changed",
    unpause: "started",
    update: "not_changed"
}

export default containerStatusMap


