//markdown语法特殊字符
const mkSyntaxChars = [
  "\n",
  "\t",
  "#",
  "*",
  "*",
  "_",
  "`",
  ">",
  "[",
  "]",
  "(",
  ")",
  "|",
  "-",
  "+",
  ".",
  "-",
  "\\",
  "^",
  "~",
  ":",
  "=",
  "$",
  "&",
  " ",
  " "//不知道是个什么字符，反正他就是个字符
];
const towxml = require("./index");
const {
  textRenderCb,
  textInstaceUuid,
  curText,
} = require("./typable-text/text-cb");
Component({
  options: {
    styleIsolation: "shared",
  },
  properties: {
    mdText: {
      type: String,
      value: "",
    },
    speed: {
      type: Number,
      value: 20,
    },
    isFinish: {
      type: Boolean,
      value: false,
    },
    openTyper: {
      type: Boolean,
      value: true,
    },
    theme: {
      type: String,
      value: "light",
    },
  },
  observers: {
    mdText: function (newVal) {
      if (!this.data.openTyper && newVal) {
        this.setData({ dataNodes: towxml(newVal, "markdown").children });
      }
      if (this.data.openTyper && newVal && !this.isStarted) {
        this.isStarted = true;
        this.startType();
      }
    },
  },
  lifetimes: {
    ready: function () {
      if (this.data.openTyper && this.data.mdText && !this.isStarted) {
        this.isStarted = true;
        this.startType();
      }
    },
  },
  data: {
    dataNodes: [],
    isStarted: false,
  },
  methods: {
    startType() {
      const _this = this;
      let finishIndex = -1;
      let c = 0;
      let typerText = "";
      let allText = "";
      let oldFirstLevelChildNodes = [];
      let timer = undefined;
      let testAfterMkSyntaxChar = "";
      let flag = false;
      let tmpUuid = "";
      let index = 0;
      let lastCurText = ""
      timer = setInterval(() => {
        if (_this.data.isFinish && c >= _this.data.mdText.length) {
          //由于typable-text.js中这句话if (curShowText.length === tmpText.length && curShowText === tmpText) 的判断不一定精确，所以可能会导致最后一句文本打印不完全，所以在结束前，把下面的代码重复执行一遍，也是迫不得已
          //核心原因就是，特殊字符后的文本不一定会创建新的文本组件实例，可能是作用在该特殊文本之前的文本组件实例，导致curShowText === tmpText为false，导致最后一句文本没有打印完全，而中间的文本会进行样式复位修复，所以不存在打印不完全的情况
          //这个地方暂时没想到最优解，暂时先这样用着
          const objTree = towxml(allText.substring(finishIndex), "markdown");
          for (let i = 0; i < objTree.children.length; i++) {
            _this.dataNodes[oldFirstLevelChildNodes.length + i] =
              objTree.children[i];
            //通过路径的方式，一个个元素地渲染，比直接_this.setData(dataNodes,数组)的方式，效率提高很多
            _this.setData({
              [`dataNodes[${oldFirstLevelChildNodes.length + i}]`]:
                objTree.children[i],
            });
          }
          this.triggerEvent("finish", {
            message: "打字完毕！",
          });

          clearInterval(timer);
          return;
        }
        if (!_this.data.mdText || c >= _this.data.mdText.length) {
          return;
        }
        const singleChar = _this.data.mdText[c];
        const lastSingleChar = _this.data.mdText[c - 1];
        c++;
        if (singleChar == undefined) {
          return;
        }
        typerText = typerText + singleChar;
        allText = allText + singleChar;
        if (_this.isMkSyntaxChar(lastSingleChar, singleChar)) {
          testAfterMkSyntaxChar = "";
        } else {
          testAfterMkSyntaxChar = testAfterMkSyntaxChar + singleChar;
          if (testAfterMkSyntaxChar.length == 1) {
            tmpUuid = textInstaceUuid.value;
            lastCurText = curText.value
            const objTree = towxml(allText.substring(finishIndex), "markdown");
            // console.log("当前finishIndex: ", finishIndex);
            // console.log("当前字符串：\n", allText.substring(finishIndex));
            // console.log("测试第一个字符的匹配性：", (mkSyntaxChars.includes(singleChar) || singleChar.match(/\r?\n/g) || singleChar.match(/\t/g)));
            // console.log("渲染对应的第一个字符：", singleChar);
            // console.log("当前对象数据：", objTree.children);
            if (!flag) {
              flag = true;
              _this.dataNodes = objTree.children;
              _this.setData({ dataNodes: objTree.children });
            } else {
              for (let i = 0; i < objTree.children.length; i++) {
                _this.dataNodes[oldFirstLevelChildNodes.length + i] =
                  objTree.children[i];
                //通过路径的方式，一个个元素地渲染，比直接_this.setData(dataNodes,数组)的方式，效率提高很多
                _this.setData({
                  [`dataNodes[${oldFirstLevelChildNodes.length + i}]`]:
                    objTree.children[i],
                });
              }
              //上一次可能渲染了多余的节点，这次要去掉
              for (
                let x =
                  oldFirstLevelChildNodes.length + objTree.children.length;
                x < _this.dataNodes.length;
                x++
              ) {
                _this.setData({ [`dataNodes[${x}]`]: { tag: "unknow" } });
              }
            }
            //以下是判断是否可以复用的逻辑，复用的条件就是：当最新的内容转化出来有n个节点，那么只有第n个是可能不完整的，前n-1个是可以复用的
            //allText.substring(finishIndex, allText.length - 1)截至是 allText.length - 1而不是allText.length，是为了避免1. 2.这种有序列表情况触发的问题，因为1，2不是markdown特殊语法字符，但是1. 却是
            const curNewNodes = towxml(
              allText.substring(finishIndex, allText.length - 1),
              "markdown"
            );
            const curNewNodesNum = Math.min(
              curNewNodes.children.length,
              objTree.children.length
            );
            if (curNewNodesNum >= 2) {
              for (let i = 0; i < curNewNodesNum - 1; i++) {
                oldFirstLevelChildNodes.push(objTree.children[i]);
              }
              let j = c;
              while (true) {
                //allText[j - 1].match( /\r?\n/g) 这句话也是为了避免1. 2.这种有序列表情况触发的问题
                //应该判断allText[j - 1] && allText[j - 1].match(/\r?\n/g) 和 tmpNodes.children.length <= curNewNodesNum - 1同时成立，拆成两个if,提高效率
                if (allText[j - 1] && allText[j - 1].match(/\r?\n/g)) {
                  const tmpNodes = towxml(
                    allText.substring(finishIndex, j),
                    "markdown"
                  );
                  if (tmpNodes.children.length <= curNewNodesNum - 1) {
                    finishIndex = j;
                    break;
                  }
                }
                j--;
              }
            }
          } else {
            // console.log("当前c和当前字符的值：", c, singleChar);
            // console.log("tmpUuid的值", tmpUuid);
            // console.log("textInstaceUuid.value的值", textInstaceUuid.value);
            // console.log("curText.value:")
            // console.log(curText.value)
            // console.log("c - index - 1的值", c - index - 1)
            // console.log("curText.value.length的值", curText.value.length)
            if (textRenderCb.value && singleChar) {
              if (tmpUuid != textInstaceUuid.value) {
                if (testAfterMkSyntaxChar.length == 2) {
                  index = c - 2;
                }
                textRenderCb.value(singleChar);
              }
              if (tmpUuid == textInstaceUuid.value && (c - index - 1 === curText.value.length)) {
                textRenderCb.value(singleChar);
              }
              if (tmpUuid == textInstaceUuid.value && testAfterMkSyntaxChar.length == 2 && curText.value == lastSingleChar && lastCurText != curText.value) {
                index = c - 2;
                textRenderCb.value(singleChar);
              }
            }
          }
        }
      }, _this.data.speed);
    },
    isMkSyntaxChar(c1, c2) {
      const ar1 = [" ", "#", "+", ":", "("];
      const ar2 = ["##", "**", "__", "--", "``", "~~", "# ", ". ", "  "];
      const ar3 = ["*", "_", "`", "~"]; //ar3中包含的markdwon字符是可能有意义的
      const spaceLikeCodes = [32, 160, 8203, 8204, 8205, 8239, 12288]//长得像空格的特殊码值
      // 普通空格	32
      // 不间断空格	160
      // 零宽空格	8203
      // 零宽不连字	8204
      // 零宽连字	8205
      // 窄空格	8239
      // 全角空格	12288
      if (spaceLikeCodes.includes(c2.charCodeAt(0))) {
        return true
      }
      if (ar3.includes(c2)) {
        return true;
      } //ar1中字符前面不是特殊的markdown字符，那一定不是有特殊含义的markdwon字符
      // if (ar1.includes(c2) && !mkSyntaxChars.includes(c1)) {
      //   return false;
      // } //如果.号的前面不是数字,那一定不是有特殊含义的markdwon字符
      // if (!/^\d$/.test(c1) && c2 == ".") {
      //   return false;
      // } 
      // //如果连续两个markdwon特殊字符的组合不是ar2中的一个，且第二个字符串不为" "以及换行符,那第二个字符一定没有意义
      // if (
      //   mkSyntaxChars.includes(c1) &&
      //   mkSyntaxChars.includes(c2) &&
      //   c2 != " " &&
      //   !c1.match(/\r?\n/g) &&
      //   !c2.match(/\r?\n/g) &&
      //   !ar2.includes(c1 + c2)
      // ) {
      //   return false;
      // }
      return mkSyntaxChars.includes(c2) || c2.match(/\r?\n/g) || c2.match(/\t/g);
    },
  },
});
