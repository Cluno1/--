/** 校正信息 */
// 定时器
let tooltipTimer = null;

// 错误标记段落选中
$('.content.revise').click(function () {
      // 选中背景色
      const selectedBackgroundColor = 'rgb(234, 249, 236)';
      // 背景颜色是选中状态
      const isBackgroundColor = $(this).css('background-color') === selectedBackgroundColor;
      // 初始化所有背景颜色
      $('.content.revise').css('background-color', '#F9F9F9');
      // 取消选中
      if (isBackgroundColor) return hideTooltip();
      // 光标移上 -> 修改当前段落的颜色
      $(this).css('background-color', selectedBackgroundColor);
      // 清除定时器
      clearTimeout(tooltipTimer);
      // 获取段落id
      const paragraphId = $(this).attr('data-id');
      // 查询问题信息
      const list = questions.find(q => q.paragraphId === Number(paragraphId)).list;
      // 迭代表格
      const trs = list.map(({
            type,
            description,
            standard
      }) => (`
            <tr>
                  <td>${ type }</td>
                  <td><div><span>${ description }</span></div></td>
                  <td>${ standard }</td>
            </tr>`
      )).join('');
      // 添加校正信息
      $('.revise-tooltip .table tbody').html(trs);
      // 显示tooltip
      $('.revise-tooltip').css({
            opacity: 1,
            zIndex: 99
      });
      // 更新tooltip下标
      $('.revise-tooltip .wrapper .headline span').attr('data-index', $(this).parent().index() + 1);
});

// 隐藏tooltip
const hideTooltip = () => {
      $('.revise-tooltip').css({
            opacity: 0,
            zIndex: -1
      }).find('p').text('');
      $('.content.revise').css('background-color', '#F9F9F9');
};

/** 点击 tooltip 关闭按钮 */
$('.revise-tooltip .close').click(hideTooltip);

/** 滚动监听 */
// 定时器节流
let scrollTimer = null;
$([window]).scroll(function() {
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