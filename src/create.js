import ora from 'ora';
import inquirer from 'inquirer';
import fs from 'fs';
import chalk from 'chalk';
import symbol from 'log-symbols';
import axios from 'axios'

import { name } from '../package.json'
import { downloadLocal } from './utils/get';
import { getAll } from './utils/rc'



let loading = async (fn, startMsg, failMsg) => {
    let fetch = ora(startMsg);
    let result = null

    try {
        fetch.start();
        result = await fn()
        fetch.succeed('完成')

        return result
    } catch (e) {
        fetch.fail(failMsg)
        return null
    }
}



let fetchReposList = async () => {
    let config = await getAll()
    let url = `https://api.github.com/users/${config.registry}/repos`
    let { data } = await axios.get(url)
    return data
}


let downRepos = (templateName, projectName) => async () => {
    let result = await downloadLocal(templateName, projectName)
    return result
}




let init = async (templateName, projectName) => {
    /**
     * 1.获取仓库信息。通过ajax获取 lsx4715126（git用户） 下的所有仓库信息
     */
    let data = await loading(fetchReposList, '开始获取仓库列表...', '仓库列表获取失败!')
    // console.log(data)
    if(!data) return

    let reposList = data.map(item => item.name).filter(item => item.name != name)

    if(!templateName){// 未传入要下载的仓库名        
        let repos = await inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: '请选择仓库:',
                choices: reposList
            },
        ])
        // console.log(repos.name)

        templateName = repos.name
    }else{// 传入要下载的仓库名，判断远程仓库中是否包含传入的仓库名       
        let isInclude = reposList.some(item => item == templateName)
        if(!isInclude) {
            console.log(symbol.error, chalk.red('该仓库不存在'));
            return
        }
    }
    
    
    
    
    
    
    
    
    /**
     * 2.未传入项目名。就把仓库名赋值给项目名
     */
    if(!projectName) {
        projectName = templateName
    }


    




    /**
     * 3.项目不存在。开始拉去仓库
     */
    if (!fs.existsSync(projectName)) {
        //命令行交互
        let answer = await inquirer.prompt([
            {
                name: 'description',
                message: '请输入项目描述: '
            },
            {
                name: 'author',
                message: '请输入作者: '
            }
        ])




        await loading(downRepos(templateName, projectName), '开始下载仓库...', '下载仓库失败!')

        const fileName = `${projectName}/package.json`;
        if(fs.existsSync(fileName)){
            const data = fs.readFileSync(fileName).toString();
            let json = JSON.parse(data);
            json.name = projectName;
            json.author = answer.author;
            json.description = answer.description;
            //修改项目文件夹中 package.json 文件
            fs.writeFileSync(fileName, JSON.stringify(json, null, '\t'), 'utf-8');
            console.log(symbol.success, chalk.green('项目初始化完成!'));
        }
    }else {
        //项目已经存在
        console.log(symbol.error, chalk.red('本地已存在该项目'));
    }
}

module.exports = init;