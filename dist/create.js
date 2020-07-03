'use strict';

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _logSymbols = require('log-symbols');

var _logSymbols2 = _interopRequireDefault(_logSymbols);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _package = require('../package.json');

var _get = require('./utils/get');

var _rc = require('./utils/rc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let loading = async (fn, startMsg, failMsg) => {
    let fetch = (0, _ora2.default)(startMsg);
    let result = null;

    try {
        fetch.start();
        result = await fn();
        fetch.succeed('完成');

        return result;
    } catch (e) {
        fetch.fail(failMsg);
        return null;
    }
};

let fetchReposList = async () => {
    let config = await (0, _rc.getAll)();
    let url = `https://api.github.com/users/${config.registry}/repos`;
    let { data } = await _axios2.default.get(url);
    return data;
};

let downRepos = (templateName, projectName) => async () => {
    let result = await (0, _get.downloadLocal)(templateName, projectName);
    return result;
};

let init = async (templateName, projectName) => {
    /**
     * 1.获取仓库信息。通过ajax获取 lsx4715126（git用户） 下的所有仓库信息
     */
    // let data = await loading(fetchReposList, '开始获取仓库列表...', '仓库列表获取失败!')
    // // console.log(data)
    // if(!data) return

    // let reposList = data.map(item => item.name).filter(item => item != name)

    let reposList = ['cms-back', 'cms-front'];

    if (!templateName) {
        // 未传入要下载的仓库名        
        let repos = await _inquirer2.default.prompt([{
            type: 'list',
            name: 'name',
            message: '请选择仓库:',
            choices: reposList
        }]);
        // console.log(repos.name)

        templateName = repos.name;
    } else {
        // 传入要下载的仓库名，判断远程仓库中是否包含传入的仓库名       
        let isInclude = reposList.some(item => item == templateName);
        if (!isInclude) {
            console.log(_logSymbols2.default.error, _chalk2.default.red('该仓库不存在'));
            return;
        }
    }

    /**
     * 2.未传入项目名。就把仓库名赋值给项目名
     */
    if (!projectName) {
        projectName = templateName;
    }

    /**
     * 3.项目不存在。开始拉去仓库
     */
    if (!_fs2.default.existsSync(projectName)) {
        //命令行交互
        let answer = await _inquirer2.default.prompt([{
            name: 'description',
            message: '请输入项目描述: '
        }, {
            name: 'author',
            message: '请输入作者: '
        }]);

        await loading(downRepos(templateName, projectName), '开始下载仓库...', '下载仓库失败!');

        const fileName = `${projectName}/package.json`;
        if (_fs2.default.existsSync(fileName)) {
            const data = _fs2.default.readFileSync(fileName).toString();
            let json = JSON.parse(data);
            json.name = projectName;
            json.author = answer.author;
            json.description = answer.description;
            //修改项目文件夹中 package.json 文件
            _fs2.default.writeFileSync(fileName, JSON.stringify(json, null, '\t'), 'utf-8');
            console.log(_logSymbols2.default.success, _chalk2.default.green('项目初始化完成!'));
        }
    } else {
        //项目已经存在
        console.log(_logSymbols2.default.error, _chalk2.default.red('本地已存在该项目'));
    }
};

module.exports = init;