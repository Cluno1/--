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
const result = document.querySelectorAll('.result .right ul li span');
// 数据
const data = [];
// 迭代数据值
result.forEach((item, index) => {
      // 获取占比
      const value = item.attributes['data-value'].value;
      // 添加数据
      data.push(parseFloat(value.replace('%', '')));
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
                        color: '#FAB921'
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
if(id === 'example' || isExternal) $('.action-bar .download-result').remove();
/** 不是外部打开 */
if(!isExternal) $('.action-bar .look-pdf').remove();

/**
 * 查看PDF
 */
$('.action-bar .look-pdf').click(() => {
      // 打开pdf
      window.open(document.location.href.replace('.html', '.pdf'), 'target');
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
$('.aigc-fragment .fragment p').click(function() {
      // id
      const ids = $(this).attr('data-node-ids').split(',');
      // 是否找到
      let isFound = false;
      // 查询原文
      Array.from($('.original-content ul li .paragraph')).forEach(item => {
            // id一致
            if(ids[0] === $(item).attr('data-id')) {
                  // 文字标签
                  const spans = $(item).find('span');
                  // 迭代span
                  Array.from(spans).forEach(span => {
                        // 背景颜色
                        const backgroundColor = $(span).css('color').replace('rgb', 'rgba').replace(')', ', 0.15)');
                        // 目标元素
                        const targetElement = $(span).get(0);
                        // 更改颜色
                        targetElement.style.setProperty('background-color', backgroundColor, 'important');
                        // 延迟恢复颜色
                        setTimeout(() => targetElement.style.setProperty('background-color', 'transparent', 'important'), 2000);
                  });
                  // 如果找到则返回
                  if (isFound) return;
                  // 更新状态
                  isFound = true;
                  // 滚动
                  $('html, body').animate({
                        scrollTop: $(item).offset().top - 50
                  }, 500);
            }
      });
});


/** AIGC片段列表 文字提示 */
// 定时器
let tooltipTimer = null;
/**
 * 添加hover事件
 */
$('.aigc-fragment table tbody tr .fragment p').hover(function (e) {
      // 清除定时器
      clearTimeout(tooltipTimer);
      // 离开
      if (e.type === 'mouseleave') {
            // 初始化
            isHideTooltip = true;
            // 判断是否隐藏
            tooltipTimer = setTimeout(() => hideTooltip(), 200);
            // 拦截
            return;
      }
      // 获取td rect信息
      const rect = $(this).get(0).getBoundingClientRect();
      // 内容
      const content = $(this).text();
      // 显示错误信息
      $('.tooltip').find('p').text(content);
      // 获取tooltip rect信息
      const tooltipRect = $('.tooltip').get(0).getBoundingClientRect();
      // 显示tooltip
      $('.tooltip').css({
            left: rect.x + rect.width / 2 - tooltipRect.width / 2,
            top: rect.y - tooltipRect.height - 4,
            opacity: 1,
            zIndex: 99
      });
});

/**
 * tooltip添加hover事件
 */
$('.tooltip').hover(function (e) {
      // 离开
      if (e.type === 'mouseleave') {
            // 隐藏
            hideTooltip();
            // 拦截
            return;
      }
      // 清除定时器
      clearTimeout(tooltipTimer);
});

// 隐藏tooltip
const hideTooltip = () => {
      $('.tooltip').css({
            opacity: 0,
            zIndex: -1
      }).find('p').text('');
};


/** 滚动监听 */
// 定时器节流
let scrollTimer = null;
// 滚动条滚动
$([window, $('.aigc-fragment table tbody')[0]]).scroll(function() {
      // 拦截
      if (scrollTimer) return;
      // 帧
      scrollTimer = requestAnimationFrame(function() {
            // 隐藏工具tip
            hideTooltip();
            // 初始化
            scrollTimer = null;
      });
});


/** 解析侧边栏 */
$(() => {
      // 侧边栏元素
      const sidebarElement = $('.original-content .container .sidebar');
      // 元素不存在
      if(!sidebarElement.length) return;
      // 上一个元素距离顶部的位置
      let prevTop = 0;
      // 解析AIGC片段列表
      aigcFragments.forEach(({
            nodeIds,
            words,
            rate
      }) => {
            // 开始id
            const startId = nodeIds[0];
            // 结束id
            const endId = nodeIds.at(-1);
            // 第一个元素
            const firstNode = $(`.original-content ul li .paragraph[data-id="${startId}"]`);
            // 最后一个元素
            const lastNode = $(`.original-content ul li .paragraph[data-id="${endId}"]`);
            // 侧边栏高度
            let sidebarHeight = 0;
            // id相同 -> 表示中间存在多个相同的段落
            if (startId === endId) {
                  // 迭代元素
                  Array.from(firstNode).forEach(element => {
                        // 当前节点的位置
                        const top = $(element).offset().top;
                        // 位置相同
                        if (top === prevTop) {
                              // 跳过
                              return;
                        }
                        // 叠加当前元素高度
                        sidebarHeight += $(element).outerHeight();
                        // 更新上一次位置
                        prevTop = top;
                  });
            } else {
                  sidebarHeight = lastNode.offset().top - firstNode.offset().top + lastNode.outerHeight();
            }
            // 值为0
            const top = firstNode.offset().top - sidebarElement.offset().top;
            // 字体颜色
            const color = firstNode.find('span').css('color');
            // 背景颜色
            const backgroundColor = color.replace('rgb', 'rgba').replace(')', ', 0.15)');
            // 插入侧边栏
            sidebarElement.append(`
                  <li style="top: ${top}px; height: ${sidebarHeight}px; background-color: ${backgroundColor};">
                        <span style="color: ${color};">${rate}（${words}）</span>
                        <div style="background-color: ${color};"></div>
                  </li>
            `);
      });
});