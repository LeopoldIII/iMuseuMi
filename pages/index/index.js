//index.js

Page({
  data: {
    demoList: [
      { id: 'FMMapBasic', name: '初始化地图' },
      { id: 'FMController', name: 'UI控件' },
      { id: 'FMEvent', name: '事件响应' },
      { id: 'FMOverlayImageMarker', name: '添加图片覆盖物' },
      { id: 'FMOverlayTextMarker', name: '添加文字覆盖物' },
      { id: 'FMOverlayPolygonMarker', name: '添加多边形覆盖物' },
      { id: 'FMOverlayLineMarker', name: '添加线覆盖物' },
      { id: 'FMSearchAnalysisBaseInfo', name: '在地图中搜索' },
      { id: 'FMSearchAnalysisBound', name: '基于位置的周边搜索' },
      { id: 'FMNavigationBase', name: '路线搜索' },
      { id: 'FMLocationMarker', name: '实时定位' },
      { id: 'FMNaviReal', name: '实时导航' },
    ]
  },
  toDemo(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../${id}/index`
    })
  }
})
