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
const tl = require("azure-pipelines-task-lib/task");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get inputs
            var url = tl.getInput('url', true);
            var accessKey = tl.getInput('accessKey', true);
            var secretKey = tl.getInput('secretKey', true);
            var force = tl.getBoolInput('force', false);
            var wait = tl.getBoolInput('wait', false);
            var image = tl.getInput('image', false);
            var tag = tl.getInput('tag', false);
            // install tools
            yield tl.exec('sudo', ["apt", "install", "docker", "-y"]);
            // mount command
            const args = new Array();
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
            var result = yield tl.exec('docker', args);
            if (result > 0) {
                tl.setResult(tl.TaskResult.Failed, "------------- Ops, upgrade failed!");
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
