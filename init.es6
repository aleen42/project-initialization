/******************************************************************
 *                                                                _
 * 	 _____  _                           ____  _                 |_|
 *	|  _  |/ \   ____  ____ __ ___     / ___\/ \   __   _  ____  _
 *	| |_| || |  / __ \/ __ \\ '_  \ _ / /    | |___\ \ | |/ __ \| |
 *	|  _  || |__. ___/. ___/| | | ||_|\ \___ |  _  | |_| |. ___/| |
 *	|_/ \_|\___/\____|\____||_| |_|    \____/|_| |_|_____|\____||_|
 *
 *	===============================================================
 *		   More than a coder, More than a designer
 *	===============================================================
 *
 *	- Document: init.es6
 *	- Author: aleen42
 *	- Description: An initialization file for building projects,
                   which has used React, Webpack, Babel, or ESLint
 *	- Create Time: Feb, 23rd, 2018
 *	- Update Time: Feb, 23rd, 2018
 *
 *****************************************************************/

const fs = require('fs');
const path = require('path');

const moment = require('./lib/moment');
const stripIndent = require('./lib/strip-indent');
const opt = require('./lib/node-getopt')
    .create([
        ['p', 'project=[Project Path]', '\tThe path of your project'],
        ['e', 'eslint', '\tSpecify using ESLint'],
        ['b', 'babel', '\tSpecify using Babel'],
        ['w', 'webpack', '\tSpecify using Webpack'],
        ['r', 'react', '\tSpecify using React'],
        ['u', 'unit-test', '\tSpecify using Unit Test'],
        ['h' , 'help', '\tTutorial for this command']
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
                devDependencies: ['eslint@4.16.0', 'eslint-config-aleen42'].concat(opt.options.webpack ? ['eslint-loader'] : []),
            },
            files: ['.eslintrc.yaml'],
        },
        /** Webpack 1 */
        webpack: {
            name: 'Webpack',
            shell: {
                /** todo: can I get the latest version of each dependencies */
                devDependencies: ['webpack@1.13.2', 'css-loader@0.23.1', 'style-loader@0.13.1'],
            },
            files: ['alias.config.js'],
            extend: () => {
                if (!fs.existsSync(path.resolve(root, 'webpack.config.js'))) {
                    fs.writeFileSync(path.resolve(root, 'webpack.config.js'), stripIndent(`
                        /******************************************************************
                         *                                                               _
                         * 	 _____  _                           ____  _                 |_|
                         *	|  _  |/ \\   ____  ____ __ ___     / ___\\/ \\   __   _  ____  _
                         *	| |_| || |  / __ \\/ __ \\ '_  \ _ / /    | |___\\ \\ | |/ __ \\| |
                         *	|  _  || |__. ___/. ___/| | | ||_|\\ \\___ |  _  | |_| |. ___/| |
                         *	|_/ \\_|\\___/\\____|\\____||_| |_|    \\____/|_| |_|_____|\\____||_|
                         *
                         *	===============================================================
                         *		   More than a coder, More than a designer
                         *	===============================================================
                         *
                         *	- Document: webpack.config.js
                         *	- Author: aleen42
                         *	- Description: A configuration file for configuring Webpack
                         *	- Create Time: ${time}
                         *	- Update Time: ${time}
                         *
                         *****************************************************************/
                        
                        const path = require('path');
                        
                        module.exports = {
                            entry: 'index.js',
                            output: {
                                path: path.join(__dirname, 'build'),
                                filename: 'index.js'
                            },
                            resolve: {
                                alias: require('./alias.config.js')
                            },
                            resolveLoader: {
                                alias: {
                                    text: 'html-loader'
                                }
                            },
                            module: {${opt.options.eslint ?
                                `
                                preLoaders: [
                                    /** eslint */
                                    {
                                        test: /\\.js$/,
                                        loader: 'eslint-loader',
                                        exclude: /node_modules/
                                    }
                                ],
                                ` : ''}
                                loaders: [${opt.options.babel ?
                                    `
                                    /** babel */
                                    {
                                        test: /\\.js${opt.options.react ? 'x?' : ''}$/,
                                        loader: 'babel-loader',
                                        exclude: /node_modules/,
                                        query: {
                                            presets: ['es2015'${opt.options.react ? ', \'react\'' : ''}]
                                        }
                                    },
                                    ` : ''}
                                    /** style */
                                    {
                                        test: /\\.css/,
                                        loader: 'style!css?sourceMap'
                                    }
                                ]
                            }
                        };
                    `));
                }
            },
        },
        babel: {
            name: 'Babel',
            shell: {
                devDependencies: [
                    'babel-preset-es2015@6.13.2',
                    'babel-core@6.13.2'
                ].concat(opt.options.webpack ? ['babel-loader@6.2.5'] : [])
                    .concat(opt.options.react ? ['babel-preset-react@6.11.1'] : []),
            },
            extend: () => {
                if (!fs.existsSync(path.resolve(root, '.babelrc'))
                    /** unit test has to use .babelrc for configurations */
                    && (opt.options['unit-test']
                        /** webpack use babel-loader rather than .babelrc when not using unit testing frameworks */
                        || !opt.options.webpack)
                ) {
                    fs.writeFileSync(path.resolve(root, '.babelrc'), stripIndent(`
                        {
                            "presets": ["es2015"${opt.options.react ? ', "react"' : ''}],
                            "plugins": [
                                ["module-alias", [
                                    /** { "src": "./src/components", "expose": "components" }, */
                                ]]
                            ]
                        }
                    `));
                }
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
        }
    };

    /** specific folder */
    sh = new sh({ basedir: path.resolve(root) });

    for (var key in funcs) {
        if (funcs.hasOwnProperty(key) && opt.options[key]) {
            const func = funcs[key];

            /** start to initiate*/
            console.log(`init ${func.name} for the project`);

            /** dependencies */
            func.shell.dependencies && func.shell.dependencies.length && sh.exec('npm.cmd', 'install', '--save', ...func.shell.dependencies);
            func.shell.devDependencies && func.shell.devDependencies.length && sh.exec('npm.cmd', 'install', '--save-dev', ...func.shell.devDependencies);

            /** files */
            func.files && func.files.forEach(item => {
                !fs.existsSync(path.resolve(root, item))
                    && fs.writeFileSync(
                        path.resolve(root, item),
                        fs.readFileSync(path.resolve(__dirname, `./config/${item}`), { encoding: 'utf8' })
                            .replace(/__\$\{TIME}__/gi, time)
                    );
            });

            /** extend function */
            func.extend && ({}).toString.call(func.extend) === '[object Function]' && func.extend();

            /** completed */
            console.log(`init ${func.name} done.`);
        }
    }
}
