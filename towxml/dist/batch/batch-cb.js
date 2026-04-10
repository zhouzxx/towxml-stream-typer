const batchRenderCb = { value: {} };
const batchShow = { value: {} };
const batchHide = { value: {} };
const batchHeight = { value: {} }
const batchSetHeight = { value: {} }
//初始化数据
function initBatchCb(id) {
  batchRenderCb.value[id] = {}
  batchShow.value[id] = {}
  batchHide.value[id] = {}
  batchHeight.value[id] = {}
  batchSetHeight.value[id] = {}
}
//销毁数据
function destroyBatchData(id){
  batchRenderCb.value[id] = undefined
  batchShow.value[id] = undefined
  batchHide.value[id] = undefined
  batchHeight.value[id] = undefined
  batchSetHeight.value[id] = undefined
}
module.exports = {
  batchRenderCb,
  batchShow,
  batchHide,
  batchHeight,
  batchSetHeight,
  initBatchCb,
  destroyBatchData
};
