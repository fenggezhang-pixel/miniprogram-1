// pages/admin/index.js
const app = getApp()

Page({
  data: {
    password: '',
    isAuthenticated: false,
    weiboText: '',
    submitting: false,
    submitResult: null,
    canSubmit: false  // 是否可以提交
  },

  onLoad(options) {
    // 每次都需要重新输入密码，不保存认证状态
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  // 验证密码
  checkPassword() {
    const password = this.data.password.trim()
    // 默认密码：Chengdumetro
    const correctPassword = 'Chengdumetro'
    
    if (password === correctPassword) {
      this.setData({ isAuthenticated: true })
      wx.showToast({ title: '验证成功', icon: 'success' })
    } else {
      wx.showToast({ title: '密码错误', icon: 'none' })
      this.setData({ password: '' })
    }
  },

  // 微博文本输入
  onWeiboTextInput(e) {
    const value = e.detail.value
    this.setData({ 
      weiboText: value,
      canSubmit: value.trim().length > 0,  // 有文本时可以提交
      submitResult: null // 清除之前的结果
    })
  },

  // 提交数据
  async submitData() {
    const weiboText = this.data.weiboText.trim()
    
    if (!weiboText) {
      wx.showToast({ title: '请输入微博文本', icon: 'none' })
      return
    }

    this.setData({ submitting: true, submitResult: null })

    try {
      wx.showLoading({ title: '提交中...', mask: true })
      
      const res = await wx.cloud.callFunction({
        name: 'fetchWeiboData',
        data: {
          text: weiboText
        }
      })

      wx.hideLoading()

      if (res.result && res.result.success) {
        wx.showToast({ title: '提交成功', icon: 'success' })
        this.setData({
          submitResult: {
            success: true,
            message: res.result.message || '数据已成功写入数据库',
            data: res.result.data
          },
          weiboText: '', // 清空输入框
          canSubmit: false // 重置提交状态
        })
      } else {
        wx.showToast({ title: res.result?.error || '提交失败', icon: 'none' })
        this.setData({
          submitResult: {
            success: false,
            message: res.result?.error || '提交失败，请检查文本格式'
          }
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('提交失败:', error)
      wx.showToast({ title: '提交失败', icon: 'none' })
      this.setData({
        submitResult: {
          success: false,
          message: error.message || '网络错误，请重试'
        }
      })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
