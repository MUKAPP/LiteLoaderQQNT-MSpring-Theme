/**
 * Heti add-on v0.1.0
 * Add right spacing between CJK & ANS characters
 *
 * 源码基于：https://github.com/sivan/heti/blob/master/js/heti-addon.js
 * 本地补丁：将 heti-adjacent 加入跳过列表，避免在聊天场景重复处理时出现多层嵌套包裹。
 */
import Finder from 'heti-findandreplacedomtext';

const hasOwn = {}.hasOwnProperty;

const HETI_NON_CONTIGUOUS_ELEMENTS = Object.assign({}, Finder.NON_CONTIGUOUS_PROSE_ELEMENTS, {
    ins: 1,
    del: 1,
    s: 1,
    a: 1,
});

const HETI_SKIPPED_ELEMENTS = Object.assign({}, Finder.NON_PROSE_ELEMENTS, {
    pre: 1,
    code: 1,
    sup: 1,
    sub: 1,
    'heti-spacing': 1,
    'heti-close': 1,
    'heti-adjacent': 1,
});

const HETI_SKIPPED_CLASS = 'heti-skip';

// 部分正则表达式修改自 pangu.js
// https://github.com/vinta/pangu.js
const CJK = '\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30fa\u30fc-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff';
const A = 'A-Za-z\u0080-\u00ff\u0370-\u03ff';
const N = '0-9';
const S = '`\~!@#\\$%\\^&\\*\\(\\)-_=\\+\\[\\]{}\\\\\\|;:\'",<.>\\/\\?';
const ANS = `${A}${N}${S}`;

const REG_CJK_FULL = `(?<=[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`;
const REG_CJK_START = `([${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`;
const REG_CJK_END = `(?<=[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)*)`;

const REG_CJK_FULL_WITHOUT_LOOKBEHIND = `(?:[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`;
const REG_CJK_END_WITHOUT_LOOKBEHIND = `(?:[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)*)`;

const REG_BD_STOP = `。．，、：；！‼？⁇`;
const REG_BD_SEP = `·・‧`;
const REG_BD_OPEN = `「『（《〈【〖〔［｛`;
const REG_BD_CLOSE = `」』）》〉】〗〕］｝`;
const REG_BD_START = `${REG_BD_OPEN}${REG_BD_CLOSE}`;
const REG_BD_END = `${REG_BD_STOP}${REG_BD_OPEN}${REG_BD_CLOSE}`;
const REG_BD_HALF_OPEN = `“‘`;
const REG_BD_HALF_CLOSE = `”’`;
const REG_BD_HALF_START = `${REG_BD_HALF_OPEN}${REG_BD_HALF_CLOSE}`;

class Heti {
    constructor(rootSelector) {
        let supportLookBehind = true;

        try {
            new RegExp(`(?<=\\d)\\d`, 'g').test('');
        } catch (error) {
            console.info(error.name, '该浏览器尚未实现 RegExp positive lookbehind');
            supportLookBehind = false;
        }

        this.rootSelector = rootSelector || '.heti';
        this.REG_FULL = new RegExp(
            supportLookBehind ? REG_CJK_FULL : REG_CJK_FULL_WITHOUT_LOOKBEHIND,
            'g'
        );
        this.REG_START = new RegExp(REG_CJK_START, 'g');
        this.REG_END = new RegExp(
            supportLookBehind ? REG_CJK_END : REG_CJK_END_WITHOUT_LOOKBEHIND,
            'g'
        );
        this.offsetWidth = supportLookBehind ? 0 : 1;

        this.funcForceContext = function forceContext(element) {
            return hasOwn.call(HETI_NON_CONTIGUOUS_ELEMENTS, element.nodeName.toLowerCase());
        };

        this.funcFilterElements = function filterElements(element) {
            return !(
                (element.classList && element.classList.contains(HETI_SKIPPED_CLASS))
                || hasOwn.call(HETI_SKIPPED_ELEMENTS, element.nodeName.toLowerCase())
            );
        };
    }

    spacingElements(elementList) {
        for (const rootElement of elementList) {
            this.spacingElement(rootElement);
        }
    }

    spacingElement(element) {
        const commonConfig = {
            forceContext: this.funcForceContext,
            filterElements: this.funcFilterElements,
        };

        const getWrapper = function (elementName, classList, text) {
            const wrapper = document.createElement(elementName);
            wrapper.className = classList;
            wrapper.textContent = text.trim();
            return wrapper;
        };

        Finder(element, Object.assign({}, commonConfig, {
            find: this.REG_FULL,
            replace: portion => getWrapper('heti-spacing', 'heti-spacing-start heti-spacing-end', portion.text),
            offset: this.offsetWidth,
        }));

        Finder(element, Object.assign({}, commonConfig, {
            find: this.REG_START,
            replace: portion => getWrapper('heti-spacing', 'heti-spacing-start', portion.text),
        }));

        Finder(element, Object.assign({}, commonConfig, {
            find: this.REG_END,
            replace: portion => getWrapper('heti-spacing', 'heti-spacing-end', portion.text),
            offset: this.offsetWidth,
        }));

        Finder(element, Object.assign({}, commonConfig, {
            find: new RegExp(
                `([${REG_BD_STOP}])(?=[${REG_BD_START}])|([${REG_BD_OPEN}])(?=[${REG_BD_OPEN}])|([${REG_BD_CLOSE}])(?=[${REG_BD_END}])`,
                'g'
            ),
            replace: portion => getWrapper('heti-adjacent', 'heti-adjacent-half', portion.text),
            offset: this.offsetWidth,
        }));

        Finder(element, Object.assign({}, commonConfig, {
            find: new RegExp(
                `([${REG_BD_SEP}])(?=[${REG_BD_OPEN}])|([${REG_BD_CLOSE}])(?=[${REG_BD_SEP}])`,
                'g'
            ),
            replace: portion => getWrapper('heti-adjacent', 'heti-adjacent-quarter', portion.text),
            offset: this.offsetWidth,
        }));

        // 使用弯引号时，在停顿符号接弯引号或弯引号接全角开引号时，间距缩进调整到四分之一。
        Finder(element, Object.assign({}, commonConfig, {
            find: new RegExp(
                `([${REG_BD_STOP}])(?=[${REG_BD_HALF_START}])|([${REG_BD_HALF_OPEN}])(?=[${REG_BD_OPEN}])`,
                'g'
            ),
            replace: portion => getWrapper('heti-adjacent', 'heti-adjacent-quarter', portion.text),
            offset: this.offsetWidth,
        }));
    }

    autoSpacing() {
        const callback = () => {
            const rootList = document.querySelectorAll(this.rootSelector);

            for (const rootElement of rootList) {
                this.spacingElement(rootElement);
            }
        };

        if (document.readyState === 'complete') {
            setTimeout(callback);
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }
}

export default Heti;
