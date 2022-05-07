const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`  // aaa-123aa或者sadad 标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`  // <my:xxx 捕获这样的标签
const startTagOpen = new RegExp(`^<${qnameCapture}`) // <div 标签开头正则 捕获的内容是标签名

const startTagClose = /^\s*(\/?)>/  // 匹配结束标签 aaa/>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配结束标签</div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性


function start(tagName, attrs) {
}
function end(tagName) { }
function chars(text) {
}

function parseHTML(html) {
  while (html) {
    let textEnd = html.indexOf('<');
    console.log(textEnd)

    if (textEnd == 0) {
      // 开始是标签
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      // 结束标签
      const endTagMath = html.match(endTag)
      if (endTagMath) {
        advance(endTagMath[0].length)
        end(endTagMath[1])
        continue;
      }
    }
    // 文本
    let text;
    if (textEnd > 0) {
      text = html.substring(0, textEnd)
    }
    if (text) {
      advance(text.length)
      chars(text);
    }
    console.log(html)
    break;
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
}

export function compileToFunctions(template) {
  // html模板 ==> rander函数
  // 1. html转化成ast语法树
  let ast = parseHTML(template)

  // 2. 通过ast语法树 生成代码
}