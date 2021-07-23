import startConsul from "./startConsul";

export default async function () {
    await startConsul();
    console.debug('Set up node complete')
}