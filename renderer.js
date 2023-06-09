(() => {
    const element = document.createElement("style");
    document.head.appendChild(element);

    const plugins_data = betterQQNT.path.plugins_data;
    document.documentElement.style.setProperty(
        "--test-theme-background",
        `url("/${plugins_data.replaceAll("\\", "/")}/test-theme/bg.jpg")`
    );

    test_theme.updateStyle((event, message) => {
        element.textContent = message;
    });
})();