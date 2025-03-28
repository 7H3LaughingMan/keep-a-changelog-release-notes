import { parser } from "keep-a-changelog";
import fs from "fs";
import core from "@actions/core";
import path from "path";
import { release } from "os";

try {
    let changelogPath = core.getInput("changelog");
    if (!changelogPath) changelogPath = "CHANGELOG.md";
    if (!path.isAbsolute(changelogPath)) {
        const root = process.env["GITHUB_WORKSPACE"] ?? process.cwd();
        changelogPath = path.join(root, changelogPath);
    }

    let outputPath = core.getInput("release");
    if (!outputPath) outputPath = "RELEASE.md";
    if (!path.isAbsolute(outputPath)) {
        const root = process.env["GITHUB_WORKSPACE"] ?? process.cwd();
        outputPath = path.join(root, outputPath);
    }

    let format = core.getInput("format")
    if (!format) format = "compact";

    let version = core.getInput("version")
    if (!version) version = "latest";

    if (!fs.existsSync(changelogPath)) {
        core.setFailed(`Unable to locate "${changelogPath}".`);
        process.exit(1);
    }

    const changelog = parser(fs.readFileSync(changelogPath, "utf-8"));
    changelog.format = format;

    if (version === "latest") {
        const release = changelog.releases.find((release) => release.date && release.version);

        if (release) {
            fs.writeFileSync(outputPath, release.toString(changelog), { encoding: "utf-8" });
        } else {
            core.setFailed(`Unable to locate the latest release.`);
            process.exit(1);
        }
    } else {
        const release = changelog.releases.find((release) => release.version === version);

        if (release) {
            fs.writeFileSync(outputPath, release.toString(changelog), { encoding: "utf-8" });
        } else {
            core.setFailed(`Unable to locate "${version}".`);
            process.exit(1);
        }
    }
} catch (error) {
    core.setFailed(error.message);
}