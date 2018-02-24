const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

class Shell {
    constructor(options = { basedir: '.' }) {
        this.basedir = options.basedir;

        this.opts /* */ = (...moreOptions) => Object.assign({ cwd: this.basedir, stdio: 'inherit', encoding: 'utf8' }, ...moreOptions);
        this.optsOut /* */ = (...moreOptions) => this.opts({ stdio: [process.stdin, 'pipe', process.stderr] }, ...moreOptions);
    }

    /**
     * execute shell synchronously and return null , while error information
     * will output into the `stdout` / `stderr` of current process.
     *
     * @param {string|Array.<string>} [command] files (String) or files with all parameters (Array of String)
     * @param {string|*} [optionOrArgs] other parameters
     * @returns null
     */
    exec(command, ...optionOrArgs) {
        let args = optionOrArgs;
        let moreOptions = [];
        if (Array.isArray(command)) {
            [command, ...args] = command;
            moreOptions = optionOrArgs;
        }

        return childProcess.execFileSync(command, args, this.opts(...moreOptions));
    }

    /**
     * execute shell synchronously and return output with string formatting,
     * while error information will output into the `stderr` of current
     * process.
     *
     * @param {string|Array.<string>} [command] files (String) or files with all parameters (Array of String)
     * @param {string|*} [optionOrArgs] 剩余的执行参数或传递额外的执行选项
     * @returns {string}
     */
    execOut(command, ...optionOrArgs) {
        let args = optionOrArgs;
        let moreOptions = [];

        if (Array.isArray(command)) {
            [command, ...args] = command;
            moreOptions = optionOrArgs;
        }

        return childProcess.execFileSync(command, args, this.optsOut(...moreOptions));
    }

    deleteRecursively(path) {
        try {
            const stat = fs.lstatSync(path);
            if (stat.isFile() || stat.isSymbolicLink()) {
                fs.unlinkSync(path); // delete file
                return;
            } /** Ignore other cases, if path is not a directory, later call of readdirSync should raise System Error */
        } catch (err) {
            if (err.code === 'ENOENT') {
                return; /** ENOENT: no such file or directory */
            }

            throw err;
        }

        fs.readdirSync(path).forEach(child => deleteRecursively(`${path}/${child}`));
        fs.rmdirSync(path);
    }

    /**
     * @param {string}   path
     * @param            [options]
     * @param {int}      [options.depth] maxDepth
     * @param {function(string, fs.Stats, string, int)} [options.callback(path, stats, relativePath, depth)]
     */
    findSync(path, options) {
        options = options || {};
        let callback = [options['callback'], arguments[1], arguments[2]].find(x => x instanceof Function);
        let maxDepth = [Number(options['depth']), 100].find(x => !isNaN(x));
        let result = callback ? undefined : [];

        exec(path, 0);

        function exec(curPath, depth) {
            let stat;
            try {
                stat = fs.lstatSync(curPath);
            } catch (err) {
                if (err.code === 'ENOENT') {
                    return; /**ENOENT: no such file or directory */
                }
            }

            callback && callback(curPath, stat, path.relative(path, curPath), depth);
            result && result.push(curPath);

            if (depth < maxDepth && stat.isDirectory()) {
                fs.readdirSync(curPath).forEach(child => {
                    exec(path.join(curPath, child), depth + 1);
                });
            }
        }

        return result;
    }

    mkdirs(dir) {
        return this.exec('mkdir', '-p', dir);
    }
}

module.exports = Shell;
