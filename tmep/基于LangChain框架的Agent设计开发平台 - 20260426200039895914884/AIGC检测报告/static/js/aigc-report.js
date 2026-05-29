// 定义父页面
const parentWindow = window.parent;
// query
const query = new URLSearchParams(location.search);
// 当前报告id
const id = query.get('id') || $('#check-report-id').text();
// 当前报告标题
const title = $('.basic-info .container ul li').eq(2).find('span').last().text();
// 是否是网站外部打开
const isExternal = !location.protocol.includes('https://') && !(parentWindow[0] instanceof Window);
// 网站主域名
const domain = 'https://www.kuaijiangchong.com.cn';
// 是否隐藏tab
const isHideTab = query.get('isHideTab') === 'true';

/**
 * 通知父页面
 */
const emit = (type = 'default', payload = {}) => {
      // 发送事件
      parentWindow.postMessage({
            type,
            payload
      }, '*');
}

/**
 * 通知父页面跳转页面
 */
const emitNavigateTo = (path = '/reduce/repetition') => {
      // 如果是外部打开查重报告
      if(isExternal) {
            // 跳转到在线网站地址
            window.open(`${domain}${path}`);
            // 返回
            return;
      }
      // 通知父组件
      emit('navigateTo', {
            path
      });
}

/** 页面加载完毕 */
$(() => {
      // 通知父组件加载完毕
      emit('loaded');
});

/** 更新检测结果图表 */
/** 引入 ECharts */
var chartDom = document.getElementById('echart-main');
var myChart = echarts.init(chartDom);
// AIGC占全文比
const result = document.querySelectorAll('.result .right ul li');
// 数据
const data = [];
// 迭代数据值
result.forEach((item, index) => {
      // 获取占比
      const value = item.lastElementChild.textContent;
      // 添加数据
      data.push(parseFloat(value.slice(1, -1)));
});
// 选项
const option = {
      animation: false,
      series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            labelLine: {
                  show: false
            },
            itemStyle: {
                  borderRadius: 6,
                  borderColor: '#FFFFFF',
                  borderWidth: 2
            },
            data: [{
                  value: 0,
                  itemStyle: {
                        color: '#EF303B'
                  }
            }, {
                  value: 0,
                  itemStyle: {
                        color: '#333333'
                  }
            }, {
                  value: 0,
                  itemStyle: {
                        color: '#DFE4EA'
                  }
            }]
      }]
};
// 计算为0的个数
let isZeroCount = 0;
// 迭代
data.forEach(item => {
      // 0
      if(Number(item) === 0) isZeroCount++;
});
// 迭代更新值
option.series[0].data.forEach((item, index) => {
      // 值
      const value = Number(data[index]);
      // 设置值
      item.value = value && value <= 0.5 ? 0.5 : value;
});
// 其中一项全部占满
if(isZeroCount === data.length - 1) option.series[0].itemStyle.borderColor = undefined;
// 设置图表选项
myChart.setOption(option);


/** 广告位点击 */
/**
 * 广告位点击
 */
$('.banner').click(function () {
      // 英文版
      if (lang === 'en') return emitNavigateTo('/reduce-en/aigc');
      // 通知父组件跳转到智能降重页面
      emitNavigateTo('/reduce/aigc' + (id === 'example' ? '' : `?id=${id}&title=${title}`));
});


/** 打包下载报告 */
// 操作栏显示/隐藏
const actionBar = $('.action-bar');
// 不显示操作烂
if(isHideTab) $('.action-bar').remove();
/** id是示例 or 外部打开，删除下载按钮 */
if(id === 'example' || isExternal) $('.action-bar .download-button').remove();

/**
 * 查看PDF
 */
$('.action-bar .look-pdf').click(() => {
      // 通知父组件查看PDF
      emit('lookPDF', {
            title
      });
});

/**
 * 打包下载结果
 */
$('.action-bar .download-result').click(() => {
      // 通知父组件下载结果
      emit('download', {
            title
      });
});

/** 片段跳转到全文 */
$('.aigc-fragment .fragment a').click(function() {
      // id
      const id = $(this).attr('id');
      // 查询原文
      Array.from($('.original-content ul li')).forEach(item => {
            // id一致
            if($(item).attr('id') === id) {
                  // 文字标签
                  const p = $(item).find('p');
                  // 背景颜色
                  const backgroundColor = p.css('color').replace('rgb', 'rgba').replace(')', ', 0.1)');
                  // 更改颜色
                  p.css('background-color', backgroundColor);
                  setTimeout(() => p.css('background-color', 'transparent'), 2000);
                  // 滚动
                  $('html, body').animate({
                        scrollTop: $(item).offset().top - 50
                  }, 500);
            }
      });
});