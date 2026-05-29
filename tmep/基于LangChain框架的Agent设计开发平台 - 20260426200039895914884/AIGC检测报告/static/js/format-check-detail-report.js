
/** 段落错误信息 */
// 所有错误标记信息id下标映射map
const paragraphMarkInfoIds = [];
// 当前选中下标
let currentParagraphMarkInfoIndex = -1;

// 更新错误标记信息下标和错误信息映射关系
$('.document li .paragraph.error').each(function () {
      // 获取id属性
      const paragraphId = $(this).attr('data-id');
      // 插入段落id
      paragraphMarkInfoIds.push(paragraphId);
});

// 错误标记段落选中
$('.document li .paragraph.error').click(function () {
      // 已经选中
      if ($(this).hasClass('active')) {
            // 初始化
            currentParagraphMarkInfoIndex = -1;
            // 选中段落
            activeParagraph();
            // 返回
            return;
      };
      // 获取段落id
      const paragraphId = $(this).attr('data-id');
      // 获取段落索引
      const paragraphIndex = paragraphMarkInfoIds.indexOf(paragraphId);
      // 更新下标
      currentParagraphMarkInfoIndex = paragraphIndex;
      // 选中段落
      activeParagraph();
});

// 上一段切换
$('.error-info .issues-wrapper .switch-question .prev').click(function () {
      // 下标递减
      currentParagraphMarkInfoIndex --;
      // 小于0
      if (currentParagraphMarkInfoIndex < 0) currentParagraphMarkInfoIndex = paragraphMarkInfoIds.length - 1;
      // 选中段落
      activeParagraph();
});

// 下一段切换
$('.error-info .issues-wrapper .switch-question .next').click(function () {
      // 下标递增
      currentParagraphMarkInfoIndex ++;
      // 大于段落数量
      if (currentParagraphMarkInfoIndex >= paragraphMarkInfoIds.length) currentParagraphMarkInfoIndex = 0;
      // 选中段落
      activeParagraph();
});

// 选中段落
const activeParagraph = () => {
      // 移除所有的选中class
      $('.document li .paragraph').removeClass('active');
      // 下标小于0 -> 隐藏段落问题
      if (currentParagraphMarkInfoIndex < 0) return renderParagraphMarkInfo(null);
      // 获取id属性
      const paragraphId = paragraphMarkInfoIds[currentParagraphMarkInfoIndex];
      // 目标段落
      let targetParagraph;
      // 查询目标段落
      $('.document li .paragraph.error').each(function () {
            if (paragraphId === $(this).attr('data-id')) targetParagraph = $(this);
      });
      // 添加选中class
      targetParagraph.addClass('active');
      // 查询段落标记信息
      const paragraphMarkInfo = markInfo.find(item => item.paragraphId === Number(paragraphId));
      // 渲染
      renderParagraphMarkInfo(paragraphMarkInfo);
      // 判断当前段落是否在可视窗口范围内
      // offsetTop
      const offsetTop = targetParagraph.offset().top;
      // 滚动区域距离顶部位置
      const scrollerOffsetTop = $('.box-scroller .box').offset().top;
      // 滚动区域高度
      const scrollerHeight = $('.box-scroller .box').height();
      // 当前元素在滚动区域内
      // 元素顶部位置 和 元素底部位置
      if (offsetTop >= scrollerOffsetTop && offsetTop + targetParagraph.height() <= scrollerOffsetTop + scrollerHeight) {
            
      } else {
            // 计算当前元素需要滚动的位置
            const scrollTop = offsetTop - scrollerOffsetTop + $('.box-scroller .box').scrollTop() - scrollerHeight / 2 + targetParagraph.height() / 2;
            // 滚动到目标位置
            $('.box-scroller .box').animate({
                  scrollTop
            }, 500);
      }
}

// 渲染段落问题标记信息
const renderParagraphMarkInfo = (markInfo) => {
      // 标记信息不存在
      if (!markInfo) {
            // 显示使用说明
            $('.error-info .use-description').show();
            // 隐藏问题
            $('.error-info .issues-wrapper').hide();
            // 拦截
            return;
      }
      // 隐藏使用说明
      $('.error-info .use-description').hide();
      // 问题
      const questionsHtml = markInfo.questions.map(question => { 
            return `
                  <div class="issue-item">
                        <div class="title">
                              <p>${question.type}：</p>
                              <p><span>${ question.questionCount }</span><span>种</span></p>
                        </div>
                        <ul>
                              ${
                                    question.issues.map((issue, index) => {
                                          return `
                                                <li>
                                                      <p class="type">
                                                            <span>${ index + 1 }</span>
                                                            <span>问题类型：</span>
                                                            <span>${ issue.type }</span>
                                                      </p>
                                                      ${
                                                            issue.contents && issue.contents.length ? `
                                                            <ul class="contents">
                                                                  ${
                                                                        issue.contents.map(content => `
                                                                              <li>${ content }</li>
                                                                        `).join('')
                                                                  }
                                                            </ul>` : ''
                                                      }
                                                      ${
                                                            issue.error ? `<p class="error">
                                                                  <span>错误：${ issue.error }</span>
                                                            </p>`: ''
                                                      }
                                                      <p class="standard">
                                                            <span>标准：${ issue.standard }</span>
                                                      </p>
                                                </li>
                                          `
                                    }).join('')
                              }
                        </ul>
                  </div>
            `
      }).join('');
      // 更新当前选中下标
      $('.error-info .question-count .mark').text(currentParagraphMarkInfoIndex + 1);
      // 更新错误数量
      $('.error-info .issues-wrapper .question-count .count').text(markInfo.questionCount);
      // 插入问题
      $('.error-info .issues-wrapper .issues').html(`${questionsHtml}`);
      // 显示问题
      $('.error-info .issues-wrapper').show();
}


/** 更新段落mark偏移位置 */
// 段落
const paragraphs = $('.paragraph');
// 迭代
paragraphs.each(function () {
      // mark
      const mark = $(this).find('.mark');
      // 不存在mark
      if (!mark.length) return;
      // 存在mark
      // 第一个span
      const firstSpan = $(this).find('span').first();
      // 不存在
      if (!firstSpan.length) return;      
      // 获取第一个span字体大小
      const fontSize = Number(firstSpan.css('font-size').replace('px', ''));
      // 距离顶部位置
      const paragraphTop = $(this).offset().top;
      // span距离顶部位置
      const firstSpanTop = firstSpan.offset().top;
      // 更新mark偏移
      mark.css({
            top: fontSize / 2 - mark.eq(0).height() / 2 + (firstSpanTop - paragraphTop) - 2 + 'px'
      });
});