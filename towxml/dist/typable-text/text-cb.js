const textRenderCb = { value: {} };
const textInstaceUuid = { value: {} };
const curText = { value: {} };
function initTextCb(id) {
  textRenderCb.value[id] = undefined;
  textInstaceUuid.value[id] = undefined;
  curText.value[id] = "";
}
function destroyTextData(id) {
  textRenderCb.value[id] = undefined;
  textInstaceUuid.value[id] = undefined;
  curText.value[id] = undefined;
}
module.exports = {
  textRenderCb,
  textInstaceUuid,
  curText,
  initTextCb,
  destroyTextData,
};
