App({
  onLaunch() {
    // 检查小程序更新
    this.checkAppUpdate()
    
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-2g5o5mivcb2a311c', 
        traceUser: true, 
        timeout: 60000 
      });
    } else {
      wx.showToast({ title: '当前微信版本过低，不支持云开发', icon: 'none' });
    }
    this.globalData = {
      db: wx.cloud.database()
    };
  },
  
  // 检查小程序更新
  checkAppUpdate() {
    // 兼容低版本微信
    if (!wx.canIUse('getUpdateManager')) {
      console.log('当前微信版本不支持 getUpdateManager')
      return
    }
    
    const updateManager = wx.getUpdateManager()
    
    // 检测是否有新版本
    updateManager.onCheckForUpdate((res) => {
      console.log('检查更新结果:', res.hasUpdate ? '有新版本' : '已是最新版本')
      if (res.hasUpdate) {
        wx.showToast({
          title: '发现新版本，正在下载...',
          icon: 'none',
          duration: 2000
        })
      }
    })
    
    // 新版本下载完成
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        confirmText: '立即更新',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            // 强制重启使用新版本
            updateManager.applyUpdate()
          }
        }
      })
    })
    
    // 新版本下载失败
    updateManager.onUpdateFailed(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败，请删除当前小程序，重新搜索打开',
        showCancel: false,
        confirmText: '我知道了'
      })
    })
  }
})