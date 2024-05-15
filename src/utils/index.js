export default {
  // 格式化日期函数
  formatDateTime (date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    var hour = date.getHours().toString();
    hour = hour.length > 1 ? hour : '0' + hour;

    var minute = date.getMinutes().toString();
    minute = minute.length > 1 ? minute : '0' + minute;

    var second = date.getSeconds().toString();
    second = second.length > 1 ? second : '0' + second;

    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
  },
  paginate (arr, pageSize, currentPage = 1) {
    // 计算要跳过的项数
    const skipIndex = (currentPage - 1) * pageSize
    // 截取数组中的一部分作为当前页的内容
    const paginateArr = arr.slice(skipIndex, skipIndex + pageSize)

    return {
      total: arr.length,
      list: paginateArr
    }
  }
}