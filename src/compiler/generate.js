function genProps(attrs) {
    let str = '';
    console.log('attrs', attrs)
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
    console.log(node, 'node')
    if (node.type === 1) {
        return generate(node); // 生成元素节点的字符串
    } else {
        let text = node.text;
        return `_v{${JSON.stringify(text)}}`
    }
}

function genChildren(el) {
    const children = el.children;
    if (children) {
        return children.map(child => gen(child).join(','))
    }
}

export function generate(el) {
    let children = genChildren(el)
    let code = `_c('${el.tag}', 
        ${el.attrs.length 
            ? `${genProps(el.attrs)}`
            : 'undefined'})
        ${children? children: ''}`;
    return code;
}