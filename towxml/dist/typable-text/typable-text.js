const { textRenderCb, textInstaceUuid, curText } = require("./text-cb");
Component({
  options: {
    styleIsolation: "shared",
  },
  properties: {
    towxmlId: {
      type: String,
      value: "",
    },
    text: {
      type: String,
      value: "",
    },
  },
  observers: {
    text: function (newVal) {
      this.setData({ showText: this.data.text });
      curText.value[this.data.towxmlId] = this.data.text;
      this.showText = this.data.text;
    }
  },
  lifetimes: {
    attached: function () {
      curText.value[this.data.towxmlId] = this.data.text;
      textInstaceUuid.value[this.data.towxmlId] = this.generateUUIDWithTimestamp();
      // console.log("生成uuid  ",this.data.text)
      this.showText = this.data.text;
      this.setData({ showText: this.showText });
      const _this = this;
      // console.log("文字组件初始化完成")
      textRenderCb.value[this.data.towxmlId] = (newText) => {
        _this.showText = _this.showText + newText;
        curText.value[_this.data.towxmlId] = _this.showText
        _this.setData({ showText: _this.showText });
      };
    }
  },
  data: {
    showText: "",
  },
  methods: {
    show() {
      this.data.isShow = true;
      this.setData({ isShow: this.data.isShow });
    },
    //生成uuid
    generateUUIDWithTimestamp() {
      const timestamp = new Date().getTime().toString(16);
      const s = [];
      const hexDigits = "0123456789abcdef";
      let index = 0;
      // 先填充时间戳部分
      for (let i = 0; i < Math.min(8, timestamp.length); i++) {
        s.push(timestamp[i]);
        index++;
      }
      // 继续填充随机数
      for (; index < 36; index++) {
        if ([8, 13, 18, 23].includes(index)) {
          s.push("-");
        } else if (index === 14) {
          s.push("4"); // bits 12 - 15 of the time_hi_and_version field to 0010
        } else if (index === 19) {
          s.push(hexDigits.substr((Math.random() * 4) | 0x8, 1)); // bits 6 - 7 of the clock_seq_hi_and_reserved to 01
        } else {
          s.push(hexDigits.substr(Math.floor(Math.random() * 0x10), 1));
        }
      }

      const uuid = s.join("");
      return uuid;
    },
  },
});
