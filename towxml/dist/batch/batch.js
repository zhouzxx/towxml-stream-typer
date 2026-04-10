const {
  batchRenderCb,
  batchShow,
  batchHide,
  batchHeight,
  batchSetHeight,
} = require("./batch-cb");
const { screenHeight, scrollRenderTimes } = require("../globalCb");
Component({
  options: {
    styleIsolation: "shared",
  },
  properties: {
    batchId: {
      type: Number,
      value: 0,
    },
    towxmlId: {
      type: String,
      value: "",
    },
  },
  lifetimes: {
    ready: function () {
      console.log(`创建了batch${this.data.batchId}`);
      screenHeight.value = wx.getSystemInfoSync().screenHeight;
      const _this = this;
      batchRenderCb.value[this.data.towxmlId][this.data.batchId] = (
        index,
        node,
        cb
      ) => {
        if (index == undefined) {
          _this.data.batchNodes = node;
          _this.setData({
            batchNodes: node,
          }, () => {
            if (cb) {
              cb()
              const setHistoryBatchHeight = () => {
                if (_this.data.height == 0) {
                  batchSetHeight.value[this.data.towxmlId][this.data.batchId](true)
                  const timer = setTimeout(() => {
                    clearTimeout(timer)
                    setHistoryBatchHeight()
                  }, 500)
                }
              }
              const _timer = setTimeout(() => {
                setHistoryBatchHeight()
                clearTimeout(_timer)
              }, 500)
            }
          });
        } else {
          _this.data.batchNodes[index] = node;
          _this.setData({
            [`batchNodes[${index}]`]: node,
          });
        }
      };

      function renderBatch(index, fromBegin, resolve) {
        if (
          index >= _this.data.batchNodes.length ||
          index < 0
        ) {
          resolve();
          return;
        }
        // if(_this.data.scrollRenderTimes != scrollRenderTimes.value){
        //   console.log(`renderBatch中断了 towxmlId:${_this.data.towxmlId} batchId:${_this.data.batchId} index:${index} 的执行`)
        //   resolve();
        //   return;
        // }
        // console.log(`执行renderBatch towxmlId:${_this.data.towxmlId} batchId:${_this.data.batchId} index:${index}`)
        _this.setData(
          {
            [`batchNodes[${index}]`]: _this.data.batchNodes[index],
          },
          () => {
            const timer = setTimeout(() => {
              renderBatch(
                fromBegin ? index + 1 : index - 1,
                fromBegin,
                resolve
              );
              clearTimeout(timer)
            }, 2);
          }
        );
      }

      batchShow.value[this.data.towxmlId][this.data.batchId] = (
        fromBegin,
        resolve
      ) => {
        if (_this.data.isShow == true) {
          resolve()
          return;
        }
        _this.data.isShow = true;
        _this.setData(
          {
            batchNodes: _this.data.batchNodes,
            isShow: true,
          },
          () => {
            const timer = setTimeout(() => {
              resolve()
              clearTimeout(timer)
            }, 5)
            console.log(
              `显示了towxml${_this.data.towxmlId}中的batch${this.data.batchId}`
            );
            // _this.data.batchNodes = tmpDataNodes;
            // _this.data.scrollRenderTimes = scrollRenderTimes.value;
            // if (fromBegin) {
            //   renderBatch(0, fromBegin, resolve);
            // } else {
            //   if (_this.data.batchNodes.length > 0) {
            //     renderBatch(
            //       _this.data.batchNodes.length - 1,
            //       fromBegin,
            //       resolve
            //     );
            //   }
            // }
          }
        );
      };

      batchHide.value[this.data.towxmlId][this.data.batchId] = (resolve) => {
        if (_this.data.isShow == false) {
          resolve()
          return;
        }
        if (_this.data.height == 0) {
          resolve()
          return;
        }
        _this.data.isShow = false;
        _this.setData({
          isShow: false,
          height: _this.data.height,
          hasSetHeight: _this.data.hasSetHeight,
        }, () => {
          const timer = setTimeout(() => {
            resolve()
            clearTimeout(timer)
          }, 2)
          console.log(
            `隐藏了towxml${_this.data.towxmlId}中的batch${this.data.batchId}`
          );
        });
      };

      batchSetHeight.value[this.data.towxmlId][this.data.batchId] = (flag) => {
        if (_this.data.hasSetHeight && !flag) {
          return;
        }
        _this.data.hasSetHeight = true;
        const query = _this.createSelectorQuery();
        query
          .select(`#batch${_this.data.batchId}`)
          .boundingClientRect((rect) => {
            if (rect) {
              _this.data.height = rect.height;
              batchHeight.value[_this.data.towxmlId][_this.data.batchId] =
                rect.height;
              _this.setData({
                hasSetHeight: _this.data.hasSetHeight,
                height: _this.data.height,
              });
              console.log(
                `设置了batch${_this.data.batchId}的高度:${rect.height}`
              );
            } else {
              console.log("未找到指定元素");
            }
          })
          .exec();
      };
    },
  },
  data: {
    batchNodes: [],
    isShow: true,
    height: 0,
    hasSetHeight: false,
    observer: undefined,
    scrollRenderTimes: 0,
  },
  methods: {},
});
