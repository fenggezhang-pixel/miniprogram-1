// pages/admin/index.js
const app = getApp()

Page({
  data: {
    password: '',
    isAuthenticated: false,
    weiboText: '',
    submitting: false,
    submitResult: null,
    canSubmit: false,  // 是否可以提交
    showPassword: false,  // 是否显示密码
    errorCount: 0  // 错误次数（仅用于显示警告）
  },

  onLoad(options) {
    // 每次都需要重新输入密码，不保存认证状态
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  // 切换密码显示/隐藏
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 验证密码
  checkPassword() {
    const password = this.data.password.trim()
    // 默认密码：Chengdumetro
    const correctPassword = 'Chengdumetro'
    
    if (password === correctPassword) {
      this.setData({ 
        isAuthenticated: true,
        errorCount: 0  // 重置错误次数
      })
      wx.showToast({ title: '验证成功', icon: 'success' })
    } else {
      // 增加错误次数（仅用于显示警告，不实际执行）
      const errorCount = this.data.errorCount + 1
      this.setData({ 
        password: '',
        errorCount: errorCount
      })
      
      // 根据错误次数显示不同的提示
      if (errorCount >= 5) {
        wx.showToast({ 
          title: '密码错误次数过多，请稍后再试', 
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.showToast({ title: '密码错误', icon: 'none' })
      }
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
        
        // 从返回的数据中提取日期
        const resultData = res.result.data || {}
        const date = resultData['date(date)'] || resultData.date || ''
        
        this.setData({
          submitResult: {
            success: true,
            message: res.result.message || '数据已成功写入数据库',
            data: {
              ...resultData,
              date: date  // 确保date字段存在
            }
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
