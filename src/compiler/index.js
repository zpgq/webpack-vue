import { generate } from "./generate"
import { parseHTML } from "./parse"


export function compileToFunctions(template) {
  // html模板 ==> rander函数
  // 1. html转化成ast语法树
  let ast = parseHTML(template)
  console.log('ast', ast)
  /*  
      attrs: (2) [{…}, {…}]
      children: [{…}]
      parent: null
      tag: "div"
      type: 1 
  */
  // 2. 通过ast树生成rander函数
  let code = generate(ast);
  console.log('code', code)
  /*  
    render() {
      return 
    }
  */
}