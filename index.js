#!/usr/bin/env node
const fs = require('fs'); // 文件模块
const program = require('commander'); // 可以自动的解析命令和参数，用于处理用户输入的命令
const download = require('download-git-repo'); // 下载并提取 git 仓库，用于下载项目模板
const handlebars = require('handlebars'); // 模板引擎，将用户提交的信息动态填充到文件中
const inquirer = require('inquirer'); // 通用的命令行用户界面集合，用于和用户进行交互
const ora = require('ora'); // 下载过程久的话，可以用于显示下载中的动画效果
const chalk = require('chalk'); // 可以给终端的字体加上颜色
const symbols = require('log-symbols'); // 可以在终端上显示出 √ 或 × 等的图标

program.version('2.1.0', '-v, --version')
    .command('init <name>')
    .action((name) => {
        if (!fs.existsSync(name)) {
            inquirer.prompt([
                {
                    type: 'list',
                    message: '请选择需要的模板:',
                    name: 'template',
                    choices: ['react模板', 'typescript模板', 'node模板', 'egg模板', 'react组件发包npm模板', 'typescript组件发包npm模板']
                }
            ]).then((answers) => {
                let branch;
                switch (answers.template) {
                    case 'react模板':
                        branch = "https://github.com:bruceliu68/react-template#master";
                        break;
                    case 'typescript模板':
                        branch = "https://github.com:bruceliu68/react-template-typescript.git#master";
                        break;
                    case 'node模板':
                        branch = "https://github.com:bruceliu68/node-template.git#master";
                        break;
                    case 'egg模板':
                        branch = "https://github.com:bruceliu68/egg-template.git#master";
                        break;
                    case 'react组件发包npm模板':
                        branch = "https://github.com:bruceliu68/react-component-template.git#master";
                        break;
                    case 'typescript组件发包npm模板':
                        branch = "https://github.com:bruceliu68/react-component-typescript-template.git#master";
                        break;
                }
                inquirer.prompt([
                    {
                        name: 'description',
                        message: '请输入项目描述'
                    },
                    {
                        name: 'author',
                        message: '请输入作者名称'
                    }
                ]).then((answers) => {
                    const spinner = ora('正在下载模板...');
                    spinner.start();
                    download(branch, name, { clone: true }, (err) => {
                        if (err) {
                            spinner.fail();
                            console.log(symbols.error, chalk.red(err));
                        } else {
                            spinner.succeed();
                            const fileName = `${name}/package.json`;
                            const meta = {
                                name,
                                description: answers.description,
                                author: answers.author
                            }
                            if (fs.existsSync(fileName)) {
                                const content = fs.readFileSync(fileName).toString();
                                const result = handlebars.compile(content)(meta);
                                fs.writeFileSync(fileName, result);
                            }
                            console.log(symbols.success, chalk.green('项目初始化完成'));
                        }
                    })
                })
            })
        } else {
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在'));
        }
    })
program.parse(process.argv);
