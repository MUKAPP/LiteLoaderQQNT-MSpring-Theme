export function onLoad() {
    const element = document.createElement("style");
    document.head.appendChild(element);

    const plugins_data = betterQQNT.plugins.mspring_theme.path.data;
    // document.documentElement.style.setProperty(
    //     "--mspring-theme-background",
    //     `url("/${plugins_data.replaceAll("\\", "/")}/bg.jpg")`
    // );

    mspring_theme.updateStyle((event, message) => {
        element.textContent = message;
    });

    mspring_theme.rendererReady();
}