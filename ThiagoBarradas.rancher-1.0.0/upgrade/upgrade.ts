import * as tl from 'azure-pipelines-task-lib/task';

async function run() {
    try {
        // get inputs
        var url: string = tl.getInput('url', true)
        var accessKey: string = tl.getInput('accessKey', true)
        var secretKey: string = tl.getInput('secretKey', true)
        var force: boolean = tl.getBoolInput('force', false);
        var wait: boolean = tl.getBoolInput('wait', false);
        var image: string = tl.getInput('image', false);
        var tag: string = tl.getInput('tag', false);

        // install tools
        await tl.exec('sudo', ["apt", "install", "docker", "-y"]);
        
        // mount command
        const args: Array<string> = new Array<string>();
        args.push('run');
        args.push('thiagobarradas/rancher-upgrader');
        args.push('execute');
        args.push('upgrade');
        args.push('--url=' + url);
        args.push('--user=' + accessKey);
        args.push('--pass=' + secretKey);
        
        if (force) {
            args.push("--force");
        } 
            
        if (wait) {
            args.push("--wait");
        }

        if (image) {
            args.push("--image=" + image);
        }

        if (tag) {
            args.push("--tag=" + tag);
        }
        
        // execute upgrade
        var result = await tl.exec('docker', args);

        if (!result) {
            tl.setResult(tl.TaskResult.Failed, "------------- Ops, upgrade failed!");
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();