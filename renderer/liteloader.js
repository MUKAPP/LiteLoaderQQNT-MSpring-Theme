// LiteLoader 框架入口文件

import { settingWindowCreated } from './index.js';

export const onSettingWindowCreated = async (view) => {
    settingWindowCreated(view);
};