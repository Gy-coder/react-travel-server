import dayjs = require("dayjs");

export default {
  base64Encode(str = "") {
    return new Buffer(str).toString("base64");
  },
  time() {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
  },
  timestamp(data) {
    return new Date(data).getTime();
  },
  unPick(source, arr) {
    if (Array.isArray(arr)) {
      let obj = {};
      for (let i in source) {
        if (!arr.includes(i)) {
          obj[i] = source[i];
        }
      }
      return obj;
    }
  },
};
