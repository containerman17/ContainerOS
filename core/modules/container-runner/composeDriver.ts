import Dockerode from "dockerode";
let removeOrphans = false;

export function setRemoveOrphans(val: boolean) {
    removeOrphans = val
}
export async function setDesiredContainersList(containerList: Dockerode.ContainerCreateOptions[]) {

}