const mdTextStore = {
  value: {},
};
const streamFinishStore = {
  value: {},
};
const stopStore = {
  value: {},
};
const towxmlIdStore = {
  value: [],
}; //记录了所有towxml实例的id
const openTyperScore = { value: {} };
const screenNum = 4;
const screenHeight = {
  value: undefined,
};
const scrollRenderTimes = {
  value: 0,
};
const setQueryTowxmlNodeFn = {
  value: undefined,
};

function destroyTowxmlData(id) {
  mdTextStore.value[id] = undefined;
  streamFinishStore.value[id] = undefined;
  stopStore.value[id] = false;
  towxmlIdStore.value = towxmlIdStore.value.filter((item) => item !== id);
  openTyperScore.value[id] = false
}

function setMdText(id, text) {
  mdTextStore.value[id] = text;
}

function setStreamFinish(id) {
  streamFinishStore.value[id] = true;
}

function stopImmediatelyCb(id) {
  stopStore.value[id] = true;
}

//节流
function throttle(func, delay) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;

  return function (...args) {
    lastArgs = args;
    lastThis = this;

    if (!timer) {
      func.apply(lastThis, lastArgs);
      timer = setTimeout(() => {
        timer = null;
        if (lastArgs) {
          func.apply(lastThis, lastArgs);
          lastArgs = null;
          lastThis = null;
        }
      }, delay);
    }
  };
}

const { batchHeight, batchHide, batchShow } = require("./batch/batch-cb");
let lastScrollTop = 0;
let scrollDirection = 0;
const scrollCb = throttle(async (e) => {
  const curScrollTop = e.detail.scrollTop;
  if (curScrollTop > lastScrollTop) {
    scrollDirection = 0;
  } else {
    scrollDirection = 1;
  }
  lastScrollTop = curScrollTop;
  if (!setQueryTowxmlNodeFn.value) {
    return;
  }
  if (typeof screenHeight.value !== "number" || !isFinite(screenHeight.value) || screenHeight.value <= 0) {
    return;
  }
  scrollRenderTimes.value = scrollRenderTimes.value + 1;
  const curScrollRenderTimes = scrollRenderTimes.value;
  setQueryTowxmlNodeFn.value(async (towxmlNodes) => {
    if (towxmlNodes && Array.isArray(towxmlNodes) && towxmlNodes.length > 0) {
      towxmlNodes.sort((a, b) => {
        return a.top - b.top;
      });
      const upIndex = [];
      const downIndex = [];
      const hideIndex = [];
      const uplimit = screenNum * screenHeight.value * -1;
      const downlimit = screenNum * screenHeight.value;
      for (let node of towxmlNodes) {
        const towxmlId = node.dataset.towxmlid;
        if (!batchHeight.value[towxmlId]) {
          continue
        }
        // console.log(`batchHeight.value[${towxmlId}]的值：`, batchHeight.value[towxmlId])
        const batchIds = Object.keys(batchHeight.value[towxmlId]);
        batchIds.sort((a, b) => parseInt(a) - parseInt(b));
        let totalHeight = 0;
        for (let i of batchIds) {
          totalHeight = totalHeight + batchHeight.value[towxmlId][i];
        }
        if (node.top > downlimit || node.top + totalHeight < uplimit) {
          for (let m of batchIds) {
            hideIndex.push({
              towxmlId,
              batchId: m,
            });
          }
        } else {
          let curTotalHeight = 0;
          for (let batchId of batchIds) {
            const curBatchHeight = batchHeight.value[towxmlId][batchId];
            const curBatchUp = node.top + curTotalHeight;
            const curBatchDown = node.top + curTotalHeight + curBatchHeight;
            if (
              (curBatchUp >= uplimit && curBatchUp <= downlimit) ||
              (curBatchDown >= uplimit && curBatchDown <= downlimit) ||
              (curBatchUp <= uplimit && curBatchDown >= downlimit)
            ) {
              if (curBatchUp < 0) {
                upIndex.push({
                  towxmlId,
                  batchId: batchId,
                });
              } else {
                downIndex.push({
                  towxmlId,
                  batchId: batchId,
                });
              }
            } else {
              hideIndex.push({
                towxmlId,
                batchId: batchId,
              });
            }
            curTotalHeight = curTotalHeight + curBatchHeight;
          }
        }
      }
      // console.log("hideIndex的值：", hideIndex)
      //先隐藏后显示，防止内存占用太多
      //隐藏
      for (let hideItem of hideIndex) {
        if (curScrollRenderTimes != scrollRenderTimes.value) {
          console.log(`globalCb中断了执行`);
          return;
        }
        await new Promise((resolve) => {
          batchHide.value[hideItem.towxmlId][hideItem.batchId](resolve);
        });
      }

      // console.log("scrollDirection的值:",scrollDirection)
      //显示
      //scrollTop 变小
      if (scrollDirection == 1) {
        if (upIndex.length > 0) {
          for (let m = upIndex.length - 1; m >= 0; m--) {
            if (curScrollRenderTimes != scrollRenderTimes.value) {
              console.log(`globalCb中断了执行`);
              return;
            }
            await new Promise((resolve) => {
              batchShow.value[upIndex[m].towxmlId][upIndex[m].batchId](
                false,
                resolve
              );
            });
          }
        }
        if (downIndex.length > 0) {
          for (let n = 0; n < downIndex.length; n++) {
            if (curScrollRenderTimes != scrollRenderTimes.value) {
              console.log(`globalCb中断了执行`);
              return;
            }
            await new Promise((resolve) => {
              batchShow.value[downIndex[n].towxmlId][downIndex[n].batchId](
                true,
                resolve
              );
            });
          }
        }
      }
      //scrollTop 变大
      else if (scrollDirection == 0) {
        if (downIndex.length > 0) {
          for (let n = 0; n < downIndex.length; n++) {
            if (curScrollRenderTimes != scrollRenderTimes.value) {
              console.log(`globalCb中断了执行`);
              return;
            }
            await new Promise((resolve) => {
              batchShow.value[downIndex[n].towxmlId][downIndex[n].batchId](
                true,
                resolve
              );
            });
          }
        }
        if (upIndex.length > 0) {
          for (let m = upIndex.length - 1; m >= 0; m--) {
            if (curScrollRenderTimes != scrollRenderTimes.value) {
              console.log(`globalCb中断了执行`);
              return;
            }
            await new Promise((resolve) => {
              batchShow.value[upIndex[m].towxmlId][upIndex[m].batchId](
                false,
                resolve
              );
            });
          }
        }
      }
    }
  });
}, 300);

module.exports = {
  setMdText,
  mdTextStore,
  streamFinishStore,
  setStreamFinish,
  destroyTowxmlData,
  stopStore,
  stopImmediatelyCb,
  towxmlIdStore,
  scrollRenderTimes,
  setQueryTowxmlNodeFn,
  scrollCb,
  screenHeight,
  openTyperScore
};
