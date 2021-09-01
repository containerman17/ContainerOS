import execa from "execa"

export default async function stackDeploy(yaml: string, stackName: string): Promise<void> {
    const { stdout, stderr } = await execa('docker', ['stack', 'deploy', '--prune', stackName, '-c', '-'], {
        input: yaml,
    });
    console.log('stdout', stdout);
    console.log('stderr', stderr);
}