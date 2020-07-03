'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.downloadLocal = undefined;

var _downloadGitRepo = require('download-git-repo');

var _downloadGitRepo2 = _interopRequireDefault(_downloadGitRepo);

var _rc = require('./rc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 
 * @param {*} templateName : 仓库名
 * @param {*} projectName : 拉到本地时，本地的文件夹名
 */
const downloadLocal = exports.downloadLocal = async (templateName, projectName) => {
    let config = await (0, _rc.getAll)();
    let url = `${config.registry}/${templateName}`;
    return new Promise((resolve, reject) => {
        console.log('仓库地址->', url);
        (0, _downloadGitRepo2.default)(url, projectName, err => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};