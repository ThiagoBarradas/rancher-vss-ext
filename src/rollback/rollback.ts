import * as tl from 'azure-pipelines-task-lib/task';

async function run() {
    try {
        // get inputs
        var url: string = tl.getInput('url', true)
        var accessKey: string = tl.getInput('accessKey', true)
        var secretKey: string = tl.getInput('secretKey', true)
        var wait: boolean = tl.getBoolInput('wait', false);

        // install tools
        await tl.exec('sudo', ["apt", "install", "docker", "-y"]);
        
        // mount command
        const args: Array<string> = new Array<string>();
        args.push('run');
        args.push('thiagobarradas/rancher-upgrader');
        args.push('execute');
        args.push('rollback');
        args.push('--url=' + url);
        args.push('--user=' + accessKey);
        args.push('--pass=' + secretKey);
            
        if (wait) {
            args.push("--wait");
        }
        
        // execute rollback
        var result = await tl.exec('docker', args);

        if (!result) {
            tl.setResult(tl.TaskResult.Failed, "------------- Ops, rollback failed!");
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();