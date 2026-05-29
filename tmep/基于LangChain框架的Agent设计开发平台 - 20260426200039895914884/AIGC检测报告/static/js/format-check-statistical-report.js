
/** 滚动条滚动自动定位左侧导航栏 */
/**
 * 根据段落选中导航栏
 */
const updateActiveTabByParagraph = () => {
      // 中心点
      const viewportCenter = window.innerHeight / 4;
      // 最小便宜
      let minDistance = Infinity;
      // 选中id
      let activeId = null;
      // 迭代每一个段落
      $('.paragraph').each(function () {
            // 获取尺寸
            const rect = this.getBoundingClientRect();
            // 中心点
            const center = (rect.top + rect.height / 2);
            // 距离
            const distance = Math.abs(center - viewportCenter);
            // 取交叉面积最大
            if (rect.bottom >= 0 && rect.top <= window.innerHeight && distance < minDistance) {
                  // 更新最小距离
                  minDistance = distance;
                  // 更新选中id
                  activeId = $(this).data('id');
            }
      });
      // 选中id存在
      if (activeId) updateNavActive(activeId);
}
// 初始化默认选中导航栏
updateActiveTabByParagraph();


/** 滚动监听 */
// 定时器节流
let scrollTimer = null;
// 滚动条滚动
$('.box-scroller .box').scroll(function() {
      // 拦截
      if (scrollTimer) return;
      // 帧
      scrollTimer = requestAnimationFrame(function() {
            // 隐藏工具tip
            hideTooltip();
            // 需要监听滚动条变化
            if (isWatchScroll) {
                  // 迭代段落计算左侧导航栏选中位置
                  updateActiveTabByParagraph();
            }
            // 初始化
            scrollTimer = null;
      });
});


/** 格式检查问题片段汇总 文字提示 */
// 定时器
let tooltipTimer = null;
/**
 * 添加hover事件
 */
$('.questions-fragments table tbody tr .content span').hover(function (e) {
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
