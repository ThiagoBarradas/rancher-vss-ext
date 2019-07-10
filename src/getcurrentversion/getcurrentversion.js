"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const tl = require("azure-pipelines-task-lib/task");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get inputs
            var url = tl.getInput('url', true);
            var accessKey = tl.getInput('accessKey', true);
            var secretKey = tl.getInput('secretKey', true);
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
            var result = yield tl.exec('curl', args);
            if (result > 0) {
                tl.setResult(tl.TaskResult.Failed, "------------- Ops, get current version failed!");
            }
            var stringContent = fs.readFileSync('response.json', 'utf8');
            var content = JSON.parse(stringContent);
            var fullImage = content.launchConfig.imageUuid.replace("docker:", "");
            var imageParts = fullImage.split(":");
            tl.setVariable("RANCHER_CURRENT_IMAGE", imageParts[0]);
            tl.setVariable("RANCHER_CURRENT_TAG", imageParts[1]);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
