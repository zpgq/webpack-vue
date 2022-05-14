const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`  // aaa-123aa或者sadad 标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`  // <my:xxx 捕获这样的标签
const startTagOpen = new RegExp(`^<${qnameCapture}`) // <div 标签开头正则 捕获的内容是标签名
const startTagClose = /^\s*(\/?)>/  // 匹配结束标签 aaa/>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配结束标签</div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性

export function parseHTML(html) {
  let root;
  let currentParent;
  let stack = [] // 校验标签是否与预期的一致

  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: 1,
      children: [],
      attrs,
      parent: null
    }
  }
  function start(tagName, attrs) {
    let elemnt = createASTElement(tagName, attrs)
    if (!root) {
      root = elemnt;
    }
    currentParent = elemnt; // 当前解析的标签保存起来
    stack.push(elemnt)
  }
  function end(tagName) {
    let elemnt = stack.pop();
    // <div> <p></p> hello </div> 
    // ==> stack[div, p] 查找为结束标签p把p弹出栈 => stack[div]
    // 弹出栈后需要把currentParent指向div, 以便后面的hello放到div内

    // 在结束标签处, 添加父子结构关系
    currentParent = stack[stack.length - 1]
    if (currentParent) {
      elemnt.parent = currentParent;
      currentParent.children.push(elemnt)
    }
  }
  function chars(text) {
    text = text.replace(/\s/g, '')
    if (text) {
      currentParent.children.push({
        type: 3,
        text,
      })
    }
  }

  while (html) {
    let textEnd = html.indexOf('<');
    if (textEnd == 0) {
      // 处理开始是标签
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      // 处理结束标签
      const endTagMath = html.match(endTag)
      if (endTagMath) { // 处理结束
        advance(endTagMath[0].length)
        end(endTagMath[1])
        continue;
      }
    }
    // 处理文本
    let text;
    if (textEnd > 0) {
      text = html.substring(0, textEnd)
    }
    if (text) {
      advance(text.length)
      chars(text);
    }
  }
  function advance(n) { // 将html字符串截取
    html = html.substring(n)
  }
  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      }
      advance(start[0].length);
      let end, attr;
      while (
        !(end = html.match(startTagClose))
        && (attr = html.match(attribute))
      ) {
        match.attrs.push({ name: attr[1], value: attr[3] })
        advance(attr[0].length)
      }
      if (end) {
        advance(end[0].length)
        return match;
      }
    }
  }

  return root
}