import { initTheme } from './theme.js';
import { setupThemeFeatures } from './features.js';
import { settingWindowCreated } from './settings.js';

// --- Shared State & Utilities ---

let themeSettings = {};

function log(...args) {
    console.log(`[MSpring Theme]`, ...args);
    if (themeSettings && themeSettings.logToMain) {
        mspring_theme.logToMain(...args);
    }
}

const frameworkType = await mspring_theme.getFrameworkType();

const plugin_path = frameworkType === "liteloader"
    ? LiteLoader.plugins["mspring-theme"].path.plugin
    : qwqnt.framework.plugins["mspring-theme"].meta.path;

function observeElement(selector, callback, callbackEnable = true, interval = 100) {
    const timer = setInterval(function () {
        const element = document.querySelector(selector);
        if (element) {
            if (callbackEnable) {
                callback();
            } else {
                callback(element);
            }
            log("已检测到", selector);
            clearInterval(timer);
        }
    }, interval);
}

// --- Initialization Logic ---

const dependencyContext = {
    log,
    mspring_theme,
    frameworkType,
    plugin_path,
    observeElement
};

async function main() {
    const settings = await initTheme(dependencyContext);
    themeSettings = settings; // Update shared settings object
    await setupThemeFeatures(settings, dependencyContext);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}

// --- Exports for Entry Points ---

// This function will be called by settingWindowCreated from the outside
async function handleSettingWindowCreated(view) {
    // We need to re-fetch settings within the settings window context
    const currentSettings = await mspring_theme.getSettings();
    themeSettings = currentSettings;
    // Pass the full context to the settings handler
    await settingWindowCreated(view, dependencyContext);
}

export {
    log,
    observeElement,
    initTheme,
    setupThemeFeatures,
    handleSettingWindowCreated as settingWindowCreated, // Rename for clarity
    plugin_path,
    frameworkType
};
