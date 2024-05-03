(function (graph) {
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
  require("./src/index.js");
})({
  "./src/index.js": {
    deps: { "./count.js": "./src/count.js", "./add.js": "./src/add.js" },
    code: '"use strict";\n\nvar _count = require("./count.js");\nvar _add = require("./add.js");\nconsole.log(_count.count);\nconsole.log(_add.add);',
  },
  "./src/count.js": {
    deps: {},
    code: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports["default"] = exports.count = void 0;\nvar count = exports.count = 123;\nvar _default = exports["default"] = {\n  a: 1\n};',
  },
  "./src/add.js": {
    deps: {},
    code: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.add = void 0;\nvar add = exports.add = 666;',
  },
});
