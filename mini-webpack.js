const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

// 1、 分析依赖
function parseModules(file) {
  const entry = getModuleInfo(file);
  const temp = [entry];
  const depsGraph = {};

  getDeps(temp, entry);
  console.log("temp", temp);
  temp.forEach((module) => {
    depsGraph[module.file] = {
      deps: module.deps,
      code: module.code,
    };
  });
  return depsGraph;
}

function getDeps(temp, { deps }) {
  // deps { './count.js': './src/count.js', './add.js': './src/add.js' }
  Object.keys(deps).forEach((key) => {
    const child = getModuleInfo(deps[key]);
    temp.push(child);
    getDeps(temp, child);
  });
}

function getModuleInfo(file) {
  // 读取文件
  const body = fs.readFileSync(file, "utf-8");
  console.log("body", body);

  // 转化AST
  const ast = parser.parse(body, {
    sourceType: "module",
  });

  const deps = {};
  traverse(ast, {
    // 获取import导入的模块
    ImportDeclaration({ node }) {
      const dirname = path.dirname(file);
      const absPath = "./" + path.join(dirname, node.source.value);
      deps[node.source.value] = absPath;
    },
  });

  // 转成es5的代码
  const { code } = babel.transformFromAstSync(ast, null, {
    presets: ["@babel/preset-env"],
  });

  console.log("deps", deps);
  // deps { './count.js': './src/count.js', './add.js': './src/add.js' }
  const moduleInfo = { file, deps, code };
  return moduleInfo;
}
// 2、实现bundle
// 多看看bundle.js 本质上，文件就是函数的执行，啥意思呢，一个文件里面require了，exports了
// 它的执行过程，由webpack翻译一下变成了：require就是执行(eval)目标文件的内容，并获取目标文件exports对象信息，赋值给
// 自己文件内的某个变量为我所用。
function bundle(file) {
  const depsGraph = JSON.stringify(parseModules(file));
  console.log("depsGraph", depsGraph);
  return `(function (graph) {
    function require(file) {
      function absRequire(realPath) {
        return require(graph[file].deps[realPath]);
      }

      var exports = {};

      (function (require, exports, code) {
        eval(code);
      })(absRequire, exports, graph[file].code);
      return exports;
    }
    require('${file}');
  })(${depsGraph})`;
}

const content = bundle("./src/index.js");
fs.writeFileSync("./dist/bundle.js", content);
