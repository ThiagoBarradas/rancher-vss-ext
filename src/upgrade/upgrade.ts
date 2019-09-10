import * as tl from 'azure-pipelines-task-lib/task';

async function run() {
    try {
        // get inputs
        var installDocker: boolean = tl.getBoolInput('installDocker', false);
        var url: string = tl.getInput('url', true);
        var accessKey: string = tl.getInput('accessKey', true);
        var secretKey: string = tl.getInput('secretKey', true);
        var force: boolean = tl.getBoolInput('force', false);
        var wait: boolean = tl.getBoolInput('wait', false);
        var image: string = tl.getInput('image', false);
        var tag: string = tl.getInput('tag', false);
        var prefixVars: string = tl.getInput('prefixVars', false);
        var manualVars: string = tl.getInput('manualVars', false);
        
        // install tools
        if (installDocker) {
            await tl.exec('sudo', ["apt", "install", "docker", "-y"]);
        }
        
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

        if (prefixVars || manualVars) {
            args.push("--update-env");
        }
        
        if (prefixVars) {
            tl.getVariables().forEach(function (variable) {
                if (variable.name.startsWith(prefixVars)) {
                    args.push("--env=\"" + variable.name + "=" + variable.value + "\"");
                }
            });
        }

        if (manualVars) {
            var vars = manualVars.replace("\r\n","\n").split("\n");
            vars.forEach(function (varName) {
                var value = tl.getVariable(varName);
                if (value == null) {
                    value = "";
                }

                args.push("--env=\"" + varName + "=" + value + "\"");
            });
        }

        if (tag) {
            args.push("--tag=" + tag);
        }
        
        // execute upgrade
        var result = await tl.exec('docker', args);

        if (result > 0) {
            tl.setResult(tl.TaskResult.Failed, "------------- Ops, upgrade failed!");
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();