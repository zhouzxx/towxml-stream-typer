
function replaceSpacesInText(html) {
    let result = '';
    let index = 0;
    const htmlLength = html.length;

    while (index < htmlLength) {
        // 检查是否为注释
        if (html.slice(index, index + 4) === '<!--') {
            const commentEnd = html.indexOf('-->', index);
            if (commentEnd !== -1) {
                result += html.slice(index, commentEnd + 3);
                index = commentEnd + 3;
                continue;
            }
        }

        // 检查是否为标签
        if (html[index] === '<') {
            const tagEnd = html.indexOf('>', index);
            if (tagEnd !== -1) {
                const tag = html.slice(index, tagEnd + 1);
                result += tag;
                index = tagEnd + 1;

                // 特殊标签处理
                if (/^<(script|style)/i.test(tag)) {
                    const endTag = `</${tag.match(/^<(\w+)/i)[1]}>`;
                    const endTagIndex = html.indexOf(endTag, index);
                    if (endTagIndex !== -1) {
                        result += html.slice(index, endTagIndex + endTag.length);
                        index = endTagIndex + endTag.length;
                    }
                }
            }
        } else {
            // 处理标签内文本
            const nextTagStart = html.indexOf('<', index);
            let text = nextTagStart !== -1 ? html.slice(index, nextTagStart) : html.slice(index);
            text = text.replace(/\s/g, '&nbsp;');
            text = text.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
            result += text;
            index = nextTagStart !== -1 ? nextTagStart : htmlLength;
        }
    }

    return result;
}

const config = require('../../config'),
    mdOption = (() => {
        let result = {
            html: true,
            xhtmlOut: true,
            typographer: true,
            breaks: true,
        };



        result.highlight = (code, lang, callback) => {
            let lineLen = code.split(/\r|\n/ig).length
            let result = code;

            
            // 代码块多换行的问题
            result = result.replace(/(\r|\n){2,}/g, str => {
                return new Array(str.length).join("<p>&nbsp;</p>")
            });
            result = result.replace(/\r|\n/g, str => {
                return "<br/>"
            });

            // 代码空格处理
            // result = result.replace(/>[^<]+</g, str => {
            //     return str.replace(/\s/g, "&nbsp;");
            // }).replace(/\t/g, new Array(4).join("&nbsp;"));


            result = replaceSpacesInText(result)
            // console.log('result的值', result)
            if (config.showLineNumber) {
                let lineStr = (() => {
                    let str = `<ul class="h2w__lineNum">`;
                    for (let i = 0; i < lineLen - 1; i++) {
                        str += `<li class="h2w__lineNumLine">${i + 1}</li>`
                    };

                    str += `</ul>`;
                    return str;
                })();
                return lineStr + result;
            };
            return result;
        }

        return result;
    })(),
    md = require('./markdown')(mdOption);

// 应用Markdown解析扩展，包括自定义组件（['sub','sup','ins','mark','emoji','todo','latex','yuml','echarts']）
md.use(require('./plugins/sub'));md.use(require('./plugins/sup'));md.use(require('./plugins/ins'));md.use(require('./plugins/mark'));

// 定义emoji渲染规则
md.renderer.rules.emoji = (token, index) => {
    let item = token[index];
    return `<g-emoji class="h2w__emoji h2w__emoji--${item.markup}">${item.content}</g-emoji>`;
};

// 导出模块
module.exports = str => {
    return md.render(str);
};
