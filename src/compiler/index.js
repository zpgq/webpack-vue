import { generate } from "./generate"
import { parseHTML } from "./parse"


export function compileToFunctions(template) {
  // html模板 ==> rander函数
  // 1. html转化成ast语法树
  let ast = parseHTML(template)

  // 2. 通过ast语法树 生成代码
  
  // 通过ast, 重新生成代码
  let code = generate(ast);
  console.log('code', code)

}