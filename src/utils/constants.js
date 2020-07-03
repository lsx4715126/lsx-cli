import {version} from '../../package.json';
let path = require('path');

//当前 package.json 的版本号
export const VERSION = version;

// 用户的根目录
const HOME = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];// C:\Users\Administrator

// 配置文件目录
export const RC = path.join(HOME, '.lsxrc');

// RC 配置下载模板的地方，给 github 的 api 使用
// https://api.github.com/users/YvetteLau/repos
// https://api.github.com/users/lsx4715126/repos
// https://api.github.com/${type}/${registry}/repos
// 模板下载地址可配置
/*
    使用方式: lsx-cli create miniSPA abc
    miniSPA: 是仓库名
    abc: 是下载到本地时创建的文件夹名
*/
export const DEFAULTS = {
    registry: 'lsx4715126',
    type: 'users'
}