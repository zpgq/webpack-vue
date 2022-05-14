const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配{{}}

// ast属性
function genProps(attrs) {
    let str = '';
    attrs.forEach(attr => {
        if (attr.name === 'style') {
            let obj = {}
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':')
                obj[key] = value
            })
            attr.value = obj
        }
        str += `${attr.name}: ${JSON.stringify(attr.value)},`
    });
    return `{${str.slice(0, -1)}}`
}

function gen(node) {
    if (node.type === 1) {
        return generate(node); // 生成元素节点的字符串
    } else {
        // 文本处理
        // _v('hlllo {{name}} world {{message}}') 
        //  ==> _v('hello' + _s(name) + 'word' + _s(message)')
        let text = node.text;
        //  defaultTagRE ==> 全局匹配{{}}
        if (!defaultTagRE.test(text)) {
            return `_v{${JSON.stringify(text)}}`
        }

        let tokens = []; // 存放每一段代码
        let lastIndex = defaultTagRE.lastIndex = 0; // 正则全局模式需要每次重置lastIndex
        let match, index;
        while(match = defaultTagRE.exec(text)) {
            index = match.index; // 保存匹配到的索引
            if (index > lastIndex) {
                console.log('text.slice(lastIndex, index)', text.slice(lastIndex, index))
                tokens.push(JSON.stringify(text.slice(lastIndex, index)))
            }
            tokens.push(`_s(${match[1].trim()})`)
            lastIndex = index = match[0].length;
        }
        console.log('tokens =>', tokens)
        if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)))
        }
        return `_v(${tokens.join('+')})`
    }
}
 // 解析子元素
function genChildren(el) {
    const children = el.children;
    if (children) {
        return children.map(child => gen(child)).join(',')
    }
}

export function generate(el) {
    let children = genChildren(el)
    let code = `_c('${el.tag}', 
        ${el.attrs.length 
            ? `${genProps(el.attrs)}`
            : 'undefined'},
        ${children? children: ''})`;
    return code;
}