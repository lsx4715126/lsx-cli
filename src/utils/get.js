import downloadGit from 'download-git-repo';
import { getAll } from './rc';


/**
 * 
 * @param {*} templateName : 仓库名
 * @param {*} projectName : 拉到本地时，本地的文件夹名
 */
export const downloadLocal = async (templateName, projectName) => {
    let config = await getAll();
    let url = `${config.registry}/${templateName}`;
    return new Promise((resolve, reject) => {
        console.log('仓库地址->', url)
        downloadGit(url, projectName, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}