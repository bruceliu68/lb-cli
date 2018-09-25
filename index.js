#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');

program.version('1.0.0', '-v, --version')
    .command('init <name>')
    .action((name) => {
        if(!fs.existsSync(name)){
            inquirer.prompt([
                {
                    type: 'list',
                    message: '请选择需要的模板:',
                    name: 'template',
                    choices: ['私有云前端标准模板', '私有云内置统一登录标准模板']
                }
            ]).then((answers) => {
                let branch = "master";
                if (answers.template === '私有云内置统一登录标准模板') branch = "withLogin";
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
                   download(`https://gitlab.tongdun.cn:bo.liu/template-react#${branch}`, name, {clone: true}, (err) => {
                       if(err){
                           spinner.fail();
                           console.log(symbols.error, chalk.red("请链接公司内网！"));
                       }else{
                           spinner.succeed();
                           const fileName = `${name}/package.json`;
                           const meta = {
                               name,
                               description: answers.description,
                               author: answers.author
                           }
                           if(fs.existsSync(fileName)){
                               const content = fs.readFileSync(fileName).toString();
                               const result = handlebars.compile(content)(meta);
                               fs.writeFileSync(fileName, result);
                           }
                           console.log(symbols.success, chalk.green('项目初始化完成'));
                       }
                   })
               })
            })
        }else{
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在'));
        }
    })
program.parse(process.argv);
