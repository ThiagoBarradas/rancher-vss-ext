import * as fs from 'fs';
import * as tl from 'azure-pipelines-task-lib/task';

async function run() {
    try {
        // get inputs
        var url: string = tl.getInput('url', true)
        var accessKey: string = tl.getInput('accessKey', true)
        var secretKey: string = tl.getInput('secretKey', true)
        var saveAndCache: boolean = tl.getBoolInput('saveAndCache', false);
        var image: string = "";
        var tag: string = "";
        var file = "data";
        var path = tl.getVariable("SYSTEM_ARTIFACTSDIRECTORY") + "/rancher_current_version";
        var fullPath = path + "/" + file;

        // use cache if available
        console.log("A");
        if (saveAndCache && tl.exist(path)) {
            console.log("B");
            var contentString = fs.readFileSync(fullPath,'utf8');
            
            var lines = contentString.split("\n");
            
            image = lines[0];
            tag = lines[1];
        } else {
            console.log("C");
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
            image = imageParts[0];
            tag = imageParts[1];
        }

        tl.setVariable("RANCHER_CURRENT_IMAGE", image);
        tl.setVariable("RANCHER_CURRENT_TAG", tag);

        // save cache if enabled
        if (saveAndCache && !tl.exist(path)) {
            var contentString = image + "\\\n" + tag;
            tl.mkdirP("rancher_current_version");
            tl.writeFile("rancher_current_version/data", contentString);
            tl.uploadArtifact("rancher_current_version", fullPath, "rancher_current_version")
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();