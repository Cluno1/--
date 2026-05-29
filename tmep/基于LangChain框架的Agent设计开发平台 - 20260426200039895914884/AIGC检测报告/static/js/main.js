// 定义父页面
const parentWindow = window.parent;
// query
const query = new URLSearchParams(location.search);
// 当前报告id
const id = query.get('id') || $('#check-report-id').text();
// 当前报告标题
const title = $('.basic-info .left li').first().find('span').last().text();
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


/** 推荐服务按钮点击 */
/**
 * 智能降重按钮点击
 */
$('.basic-info .service-button').click(() => {
      // 通知父组件跳转到智能降重页面
      emitNavigateTo(recommendServicePathMap['智能降重']);
});

// 推荐服务页面路径映射
const recommendServicePathMap = {
      '智能降重': '/reduce/repetition' + (id === 'example' ? '' : `?id=${id}&title=${title}`),
      '毕业答辩PPT': '/ppt',
      '学术润色': '/polish',
      '文章扩写': '/expand',
      'AIGC降重': '/reduce/aigc'
};

/**
 * 广告位按钮点击
 */
$('.banner').click(function () {
      // 通知父组件跳转到智能降重页面
      emitNavigateTo(recommendServicePathMap['智能降重']);
});


/** tab菜单切换 */
// 菜单映射url
const TabsPathMap = {
      '简洁报告': 'conciseReport',
      '全文对照报告': 'comparisonReport',
      '全文标明引文报告': 'markedCitationReport'
};
// tabs
$('.action-bar .tabs li').click(function () {
      // tab名称
      const tab = $(this).find('span').text();
      // 切换url
      const url = isExternal ? decodeURIComponent(document.location.href).replace(/简洁报告|全文对照报告|全文标明引文报告/g, tab) : TabsPathMap[tab] + `?id=${id}`;
      // 通知父组件 -> 切换Tab
      emit('changeTab', {
            url
      });
      // 切换报告
      window.open(url, '_self');
});

/** 打包下载报告 */
// 操作栏显示/隐藏
const actionBar = $('.action-bar');
// 不显示操作烂
if(isHideTab) $('.action-bar').remove();
/** id是示例 or 外部打开，删除下载按钮 */
if(id === 'example' || isExternal) $('.action-bar .download-button').remove();

/**
 * 打包下载结果
 */
$('.action-bar .download-button').click(() => {
      // 通知父组件下载结果
      emit('download', {
            title: $('.basic-info .left li').first().find('span').last().text()
      });
});

/** 页面加载完毕 */
$(() => {
      
      /** 根据当前页面高度自适应图片 */
      // 当前页面高度
      const height = $('html').height();
      // 更新图片高度
      $('#bg').height(height);

      /** 通知父组件加载完毕 */
      emit('loaded');
});