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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let loading = (() => {
    var _ref = _asyncToGenerator(function* (fn, startMsg, failMsg) {
        let fetch = (0, _ora2.default)(startMsg);
        let result = null;

        try {
            fetch.start();
            result = yield fn();
            fetch.succeed('完成');

            return result;
        } catch (e) {
            fetch.fail(failMsg);
            return null;
        }
    });

    return function loading(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
})();

let fetchReposList = (() => {
    var _ref2 = _asyncToGenerator(function* () {
        let config = yield (0, _rc.getAll)();
        let url = `https://api.github.com/users/${config.registry}/repos`;
        let { data } = yield _axios2.default.get(url);
        return data;
    });

    return function fetchReposList() {
        return _ref2.apply(this, arguments);
    };
})();

let downRepos = (templateName, projectName) => _asyncToGenerator(function* () {
    let result = yield (0, _get.downloadLocal)(templateName, projectName);
    return result;
});

let init = (() => {
    var _ref4 = _asyncToGenerator(function* (templateName, projectName) {
        /**
         * 1.获取仓库信息。通过ajax获取 lsx4715126（git用户） 下的所有仓库信息
         */
        let data = yield loading(fetchReposList, '开始获取仓库列表...', '仓库列表获取失败!');
        // console.log(data)
        if (!data) return;

        let reposList = data.map(function (item) {
            return item.name;
        }).filter(function (item) {
            return item != _package.name;
        });

        if (!templateName) {
            // 未传入要下载的仓库名        
            let repos = yield _inquirer2.default.prompt([{
                type: 'list',
                name: 'name',
                message: '请选择仓库:',
                choices: reposList
            }]);
            // console.log(repos.name)

            templateName = repos.name;
        } else {
            // 传入要下载的仓库名，判断远程仓库中是否包含传入的仓库名       
            let isInclude = reposList.some(function (item) {
                return item == templateName;
            });
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
            let answer = yield _inquirer2.default.prompt([{
                name: 'description',
                message: '请输入项目描述: '
            }, {
                name: 'author',
                message: '请输入作者: '
            }]);

            yield loading(downRepos(templateName, projectName), '开始下载仓库...', '下载仓库失败!');

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
    });

    return function init(_x4, _x5) {
        return _ref4.apply(this, arguments);
    };
})();

module.exports = init;