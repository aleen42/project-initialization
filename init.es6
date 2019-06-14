/********************************************************************
 *                                                                 _
 *     _____  _                           ____  _                 |_|
 *    |  _  |/ \   ____  ____ __ ___     / ___\/ \   __   _  ____  _
 *    | |_| || |  / __ \/ __ \\ '_  \ _ / /    | |___\ \ | |/ __ \| |
 *    |  _  || |__. ___/. ___/| | | ||_|\ \___ |  _  | |_| |. ___/| |
 *    |_/ \_|\___/\____|\____||_| |_|    \____/|_| |_|_____|\____||_|
 *
 *    ===============================================================
 *           More than a coder, More than a designer
 *    ===============================================================
 *
 *    - Document: init.es6
 *    - Author: aleen42
 *    - Description: An initialization file for building projects,
 *    which has used React, Webpack, Babel, or ESLint
 *    - Create Time: Feb, 23rd, 2018
 *    - Update Time: Mar, 2nd, 2018
 *
 *********************************************************************/

const fs = require('fs');
const path = require('path');

const moment = require('moment');
const prettier = require('prettier');
const prettierOpt = { tabWidth: 4, singleQuote: true };
const stripIndent = require('strip-indent');
const opt = require('node-getopt')
    .create([
        ['p', 'project=[Project Path]', '\tThe path of your project'],
        ['e', 'eslint', '\tSpecify using ESLint'],
        ['b', 'babel', '\tSpecify using Babel'],
        ['w', 'webpack', '\tSpecify using Webpack'],
        ['r', 'react', '\tSpecify using React'],
        ['u', 'unit-test', '\tSpecify using Unit Test'],
        ['s', 'server', '\tSpecify building local server'],
        ['d', 'debug', '\tDebug mode'],
        ['h', 'help', '\tTutorial for this command']
    ])
    .setHelp(stripIndent(`
        UseAge: node init.es6 -p [Project Path] [--react --eslint --babel --webpack --unit-test]
                                                                         _
             _____  _                           ____  _                 |_|
            |  _  |/ \\   ____  ____ __ ___     / ___\\/ \\   __   _  ____  _
            | |_| || |  / __ \\/ __ \\\\ \'_  \\ _ / /    | |___\\ \\ | |/ __ \\| |
            |  _  || |__. ___/. ___/| | | ||_|\\ \\___ |  _  | |_| |. ___/| |
            |_/ \\_|\\___/\\____|\\____||_| |_|    \\____/|_| |_|_____|\\____||_| 
                                                                         
            ================================================================
                        More than a coder, More than a designer              
            ================================================================
         
        [[OPTIONS]]
    `))
    .bindHelp()
    .parseSystem();

let sh = require('./shell_util.es6');

if (!opt.options.project) {
    console.log('project path has not been specified');
} else {
    const time = moment().format('MMM, Do, YYYY');
    const root = opt.options.project;
    const funcs = {
        eslint: {
            name: 'ESLint',
            shell: {
                devDependencies: ['eslint', 'eslint-config-aleen42'].concat(opt.options.webpack ? ['eslint-loader'] : []),
            },
            files: ['.eslintrc.yaml'],
        },
        /** Webpack 3.x when using babel */
        webpack: {
            name: 'Webpack',
            shell: {
                /** todo: can I get the latest version of each dependencies */
                devDependencies: [opt.options.babel ? 'webpack@3.11.0' : 'webpack', 'css-loader', 'style-loader'],
            },
            files: ['alias.config.js', 'webpack.config.js'],
            extend: (fileName, content) => {
                if (fileName === 'webpack.config.js' && !fs.existsSync(path.resolve(root, fileName))) {
                    return prettier.format(content.replace(/'__\${MODULE}__'/gi, `
                    {
                        rules: [${opt.options.eslint ? `
                            {
                                test: /\\.js$/,
                                exclude: /node_modules/,
                                loader: 'eslint-loader',
                                options: {
                                    // eslint options (if necessary)
                                }
                            },` : ''}
                            
                            ${opt.options.babel ? `
                            {
                                /** babel */
                                test: /\\.js${ opt.options.react ? 'x?' : '' }$/,
                                exclude: /(node_modules|bower_components)/,
                                use: {
                                    loader: 'babel-loader',
                                    options: {
                                        presets: ['@babel/preset-env'${ opt.options.react ? ', \'react\'' : '' }]
                                    }
                                }
                            },` : ''}

                            {
                                /** style */
                                test: /\\.css$/,
                                use: ['style-loader', 'css-loader']
                            }
                        ],
                    }
                    `), prettierOpt);
                }

                return content;
            },
        },
        babel: {
            name: 'Babel',
            shell: {
                devDependencies: [
                    'babel-cli@6.26.0',
                    'babel-preset-es2015@6.13.2',
                    'babel-core@6.13.2'
                ].concat(opt.options.webpack ? ['babel-loader@6.2.5'] : [])
                    .concat(opt.options.react ? ['babel-preset-react@6.11.1'] : []),
            },
            files: ['.babelrc'],
            extend: (fileName, content) => {
                if (fileName === '.babelrc' && !fs.existsSync(path.resolve(root, fileName))) {
                    /** unit test has to use .babelrc for configurations */
                    if (opt.options['unit-test']
                        /** webpack use babel-loader rather than .babelrc when not using unit testing frameworks */
                        || !opt.options.webpack) {
                        if (!opt.options.webpack && fs.existsSync(path.resolve(root, 'package.json'))) {
                            /** set a building script into package.json */
                            const packageContent = JSON.parse(fs.readFileSync(path.resolve(root, 'package.json'), { encoding: 'utf8' }));
                            packageContent.scripts = packageContent.scripts || {};
                            packageContent.scripts.watch = 'node ./node_modules/babel-cli/bin/babel.js -w src -d dist';
                            packageContent.scripts.build = 'node ./node_modules/babel-cli/bin/babel.js src -d dist';
                            fs.writeFileSync(path.resolve(root, 'package.json'), JSON.stringify(packageContent, null, 2));
                        }

                        return content.replace(/"__\${PRESETS}__"/gi, `"es2015"${opt.options.react ? ', "react"' : ''}`);
                    } else {
                        return '';
                    }
                }

                return content;
            },
        },
        react: {
            name: 'React',
            shell: {
                dependencies: ['react@15.3.1', 'react-dom@15.3.1'],
            },
        },
        /** Chai with Mocha */
        'unit-test': {
            name: 'Unit Testing Frameworks',
            shell: {
                devDependencies: [
                    'chai@3.5.0',
                    'mocha@2.4.5'
                ].concat(opt.options.babel ? ['babel-register@6.24.1', 'babel-plugin-module-alias@1.6.0'] : []),
            },
        },
        /** Express for building servers */
        server: {
            name: 'Server Frameworks',
            shell: {
                devDependencies: [
                    'express'
                ].concat(opt.options.webpack ? ['webpack-dev-middleware@1.6.1'] : []),
            } ,
            files: ['server.js'],
            extend: (fileName, content) => {
                if (fileName === 'server.js' && !fs.existsSync(path.resolve(root, fileName))) {
                    return prettier.format(content.replace(/'__\${WEBPACK}__'/gi, opt.options.webpack ? `
                        const webpack = require('webpack');
                        const config = require('./webpack.config.js');
                        const compiler = webpack(config);

                        app.use(require('webpack-dev-middleware')(compiler, {
                            /** options */
                        }));
                    ` : ''), prettierOpt);
                }

                return content;
            },
        },
    };

    /** specific folder */
    sh = new sh({ basedir: path.resolve(root) });

    for (var key in funcs) {
        if (funcs.hasOwnProperty(key) && opt.options[key]) {
            const func = funcs[key];

            /** start to initiate*/
            console.log(`init ${func.name} for the project`);

            /** dependencies */
            if (!opt.options.debug) {
                /** only install under non-debug mode */
                func.shell.dependencies && func.shell.dependencies.length && sh.exec('npm.cmd', 'install', '--save', ...func.shell.dependencies);
                func.shell.devDependencies && func.shell.devDependencies.length && sh.exec('npm.cmd', 'install', '--save-dev', ...func.shell.devDependencies);
            }

            /** files */
            func.files && func.files.forEach(item => {
                if (!fs.existsSync(path.resolve(root, item))) {
                    let content = fs.readFileSync(path.resolve(__dirname, `./config/${item}`), { encoding: 'utf8' })
                        .replace(/__\$\{TIME}__/gi, time);

                    /** extend file contents */
                    func.extend && ({}).toString.call(func.extend) === '[object Function]' && (content = func.extend(item, content));
                    content && fs.writeFileSync(path.resolve(root, item), content);
                }
            });

            /** completed */
            console.log(`init ${func.name} done.`);
        }
    }
}
