import * as fs from 'fs';
import * as tl from 'azure-pipelines-task-lib/task';

async function run() {
    try {
        // get inputs
        var url: string = tl.getInput('url', true)
        var accessKey: string = tl.getInput('accessKey', true)
        var secretKey: string = tl.getInput('secretKey', true)
        
        // install tools
        const args = new Array();
        args.push('-s');
        args.push('-f');
        
        args.push('--user');
        args.push(accessKey + ':' + secretKey);
        
        args.push('-w');
        args.push('\nStatusCode: %{http_code}\n\n');

        args.push('-o');
        args.push('response.json');

        args.push(url);

        // send request
        var result = await tl.exec('curl', args, );
        if (result > 0) {
            tl.setResult(tl.TaskResult.Failed, "------------- Ops, get current version failed!");
        }
        
        var stringContent = fs.readFileSync('response.json','utf8');
        var content = JSON.parse(stringContent);
        var fullImage = content.launchConfig.imageUuid.replace("docker:","");
        var imageParts = fullImage.split(":");

        tl.setVariable("RANCHER_CURRENT_IMAGE", imageParts[0]);
        tl.setVariable("RANCHER_CURRENT_TAG", imageParts[1]);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();