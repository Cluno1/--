// 定义父页面
const parentWindow = window.parent;
// query
const query = new URLSearchParams(location.search);
// 当前报告id
const id = query.get('id') || $('#check-report-id').text();
// 是否是网站外部打开
const isExternal = !location.protocol.includes('https://') && !parentWindow[0];
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


/** tab菜单切换 */
// 菜单映射url
const TabsPathMap = ['formatCheckStatisticalReport', 'formatCheckDetailReport'];
// tabs
$('header .tabs li').click(function () {
      // 下标
      const index = $(this).index();
      // 切换url
      const url = isExternal ? decodeURIComponent(document.location.href).replace(/统计报告|详细报告/g, ['统计报告', '详细报告'][index]) : TabsPathMap[index] + `?id=${id}`;
      // 通知父组件 -> 切换Tab
      emit('changeTab', {
            url
      });
      // 切换报告
      window.open(url, '_self');
});


/** 打包下载报告 */
// 操作栏显示/隐藏
const actionBar = $('header');
// 不显示操作烂
if(isHideTab) $('header').remove();
/** id不是示例 and 不是在外部打开，显示下载按钮 */
if(id !== 'example' && !isExternal) $('header .download-button').css('display', 'flex');
// 打包下载结果
$('header .download-button').click(() => {
      // 通知父组件下载结果
      emit('download', {
            title: $('#check-report-title').text()
      });
});


/** 侧边导航栏点击 */
// 是否监听滚动条变化
let isWatchScroll = true;
// 定时器
let timer = null;
// 更新nav选中
const updateNavActive = id => {
      // id不存在
      if (!id) return;
      // 清除所有 active 状态
      $('nav li').each(function () {
            $(this).removeClass('active');
      });
      // 目标li
      const targetLi = $(`nav li[data-link-id=${id}]`);
      // 添加active
      targetLi.addClass('active');
      // 父级li
      const parentLi = targetLi.parent().parent();
      // 父级
      if (parentLi.prop('tagName') === 'LI') parentLi.addClass('active');
}

// 添加点击事件
$('nav ul li').click(function (e) {
      // 阻止事件冒泡
      e.stopPropagation();
      // 拦截
      if (!isWatchScroll) return;
      // 关联id
      let linkId = $(this).attr('data-link-id');
      // 是否存在ul
      if ($(this).children('ul').length > 0) {
            // 获取第一个li
            linkId = $(this).children('ul').children('li:first-child').attr('data-link-id');
      }
      // 段落id
      $('.paragraph').each(function () {
            // 拦截
            if (!isWatchScroll) return;
            // 获取段落id
            const id = $(this).attr('data-id');
            // 关联段落id匹配
            if (linkId === id) {
                  // 更新
                  isWatchScroll = false;
                  // 更新id
                  updateNavActive(id);
                  // 滚动盒子
                  const boxScroller = $('.box-scroller .box');
                  // 滚动条距离顶部位置
                  const scrollTop = boxScroller.scrollTop();
                  // 滚动到目标位置
                  boxScroller.animate({
                        scrollTop: scrollTop + $(this).offset().top - boxScroller.offset().top - 20
                  }, 500);
                  // 延迟
                  timer = setTimeout(() => isWatchScroll = true, 600);
            }
      });
});

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

/** 广告位点击 */
/**
 * 广告位点击
 */
$('.banner').click(function () {
      // 通知父组件跳转到格式校正页面
      emitNavigateTo(`/format/revise?id=${id}&title=${encodeURIComponent($('#check-report-title').text())}`);
});