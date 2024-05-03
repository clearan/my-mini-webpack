### 手写webpack
1. 从入口文件分析依赖，当前文件依赖哪个文件，构建关系
2. 通过ast语法数读取import导入的模块，记录一下，将当前文件代码通过babel转化成es5，记录一下，构造如下
```javascript
const deps = { 
    './count.js': './src/count.js', 
    './add.js': './src/add.js' 
}

// file是到根目录的相对路径
const moduleInfo = { file, deps, code };

//递归后最终形态
[
  {
    file: './src/index.js',
    deps: { './count.js': './src/count.js', './add.js': './src/add.js' },
    code: '"use strict";\n' +
      '\n' +
      'var _count = require("./count.js");\n' +
      'var _add = require("./add.js");\n' +
      'console.log(_count.count);\n' +
      'console.log(_add.add);'
  },
  {
    file: './src/count.js',
    deps: {},
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports["default"] = exports.count = void 0;\n' +
      'var count = exports.count = 123;\n' +
      'var _default = exports["default"] = {\n' +
      '  a: 1\n' +
      '};'
  },
  {
    file: './src/add.js',
    deps: {},
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports.add = void 0;\n' +
      'var add = exports.add = 666;'
  }
]

```
3. 打包到bundle的代码是字符串，即我们要让浏览器认识并能解析它，所以上面的code是es5的语法，其中的require、exports都是commonjs的语法，我们要`自行实现`它，其实说白了，我们生成的bundle，就是从入口文件出发，执行所有依赖的子模块，而如何执行到子模块，就是利用其中用到的require 、exports将模块之间相互关联，我们遇到了require，找到根目录下的相对路径，然后eval执行code，exports就是一个子模块返回的对象