// pages/index/index.js
const app = getApp()

// 成都地铁线路颜色配置（2025年1月版）
const LINE_COLORS = {
  'line1': { name: '1号线', color: '#061098' },
  'line2': { name: '2号线', color: '#DA6648' },
  'line3': { name: '3号线', color: '#D1197D' },
  'line4': { name: '4号线', color: '#4EA666' },
  'line5': { name: '5号线', color: '#904690' },
  'line6': { name: '6号线', color: '#A36B34' },
  'line7': { name: '7号线', color: '#7CC2D5' },
  'line8': { name: '8号线', color: '#BDCB3F' },
  'line9': { name: '9号线', color: '#E1A538' },
  'line10': { name: '10号线', color: '#0A4281' },
  'line11': { name: '11号线', color: '#2C5F2D' },
  'line12': { name: '12号线', color: '#97D077' },
  'line13': { name: '13号线', color: '#B8A538' },
  'line14': { name: '14号线', color: '#E91C45' },
  'line15': { name: '15号线', color: '#6C3D79' },
  'line16': { name: '16号线', color: '#00A1E9' },
  'line17': { name: '17号线', color: '#8FC4A0' },
  'line18': { name: '18号线', color: '#235A63' },
  'line19': { name: '19号线', color: '#7D9CCD' },
  'line20': { name: '20号线', color: '#D4A76A' },
  'line22': { name: '22号线', color: '#F39800' },
  'line23': { name: '23号线', color: '#B28850' },
  'line27': { name: '27号线', color: '#1F93CB' },
  'line30': { name: '30号线', color: '#DB7791' },
  'lineS3': { name: 'S3线', color: '#CF762D' },
  'lineS13': { name: 'S13线', color: '#9E9E9E' },
  'lineMeishan': { name: '眉山线', color: '#FF6B6B' },
  'lineDeyang': { name: '德阳线', color: '#4ECDC4' },
  'lineRong2': { name: '蓉2号线', color: '#6D8841' }
}

// 节假日配置（只标注跨年）
const HOLIDAY_CONFIG = {
  '12-31': { name: '跨年', icon: '🎆', color: '#f59e0b' }
}

// 获取节假日信息
function getHolidayInfo(date) {
  try {
    if (!date) {
      return null
    }
    // 确保date是字符串类型
    const dateStr = typeof date === 'string' ? date : String(date)
    // 检查是否是有效的日期格式（YYYY-MM-DD）
    if (dateStr.length < 5 || !/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return null
    }
    const monthDay = dateStr.slice(5) || ''
    return HOLIDAY_CONFIG[monthDay] || null
  } catch (e) {
    console.error('getHolidayInfo error:', e, 'date:', date)
    return null
  }
}

const FIELD_MAP = {
  'date(date)': 'date',
  'dayType(string)': 'dayType',
  'lunarDate(string)': 'lunarDate',
  'monthCode(number)': 'monthCode',
  'weekday(string)': 'weekday',
  'line1(number)': 'line1',
  'line2(number)': 'line2',
  'line3(number)': 'line3',
  'line4(number)': 'line4',
  'line5(number)': 'line5',
  'line6(number)': 'line6',
  'line7(number)': 'line7',
  'line8(number)': 'line8',
  'line9(number)': 'line9',
  'line10(number)': 'line10',
  'line11(number)': 'line11',
  'line12(number)': 'line12',
  'line13(number)': 'line13',
  'line14(number)': 'line14',
  'line15(number)': 'line15',
  'line16(number)': 'line16',
  'line17(number)': 'line17',
  'line18(number)': 'line18',
  'line19(number)': 'line19',
  'line20(number)': 'line20',
  'line22(number)': 'line22',
  'line23(number)': 'line23',
  'line27(number)': 'line27',
  'line30(number)': 'line30',
  'lineS3(number)': 'lineS3',
  'lineS13(number)': 'lineS13',
  'lineMeishan(number)': 'lineMeishan',
  'lineDeyang(number)': 'lineDeyang',
  'lineRong2(number)': 'lineRong2',
  'totalPassenger(number)': 'totalPassenger',
  'pureMetroPassenger(number)': 'pureMetroPassenger',
  'passengerIntensity(number)': 'passengerIntensity',
  'stationIntensity(number)': 'stationIntensity',
  'entryVolume(number)': 'entryVolume',
  'transferCoeff(number)': 'transferCoeff',
  'weather(string)': 'weather',
  'maxTemp(number)': 'maxTemp',
  'minTemp(number)': 'minTemp',
  'restrictedPlate(string)': 'restrictedPlate',
  'cumulativePassenger(number)': 'cumulativePassenger'
}

const LINE_ORDER = [
  'line1', 'line2', 'line3', 'line4', 'line5', 'line6', 'line7', 'line8', 'line9', 'line10',
  'line11', 'line12', 'line13', 'line14', 'line15', 'line16', 'line17', 'line18', 'line19', 'line20',
  'line22', 'line23', 'line27', 'line30', 'lineS3', 'lineS13', 'lineMeishan', 'lineDeyang', 'lineRong2'
]

Page({
  data: {
    currentDate: '',
    selectedDate: '',
    passengerData: null,
    lineList: [],
    loading: false,
    hasData: false,
    errorMsg: '',
    // 7日数据
    weekData: [],
    showWeekChart: false,
    activeTab: 'daily', // 'daily' 或 'weekly' 或 'compare' 或 'top10'
    // 对比数据
    compareData: {
      current: null,
      custom: null
    },
    compareLoading: false,
    compareCustomDate: '', // 自定义对比日期
    showDatePicker: false, // 显示日期选择器
    // 历史前十数据
    top10List: [],
    top10Loading: false,
    top10Type: 'total', // 'metro' 纯地铁客流 或 'total' 全网客运量（含蓉2号线）
    // 详情模态框
    showDetailModal: false,
    detailModalLoading: false,
    detailModalData: {
      date: '',
      passengerData: null,
      lineList: []
    },
    // 柱状图放大查看
    showBarChartFullscreen: false,
    // 版本更新弹窗
    showVersionTip: false,
    // 长图生成状态
    generatingImage: false,
    // 日均客流数据
    dailyAverageData: {
      monthTotal: null,       // 月日均全网客运量（含蓉2号线）
      monthPure: null,        // 月日均纯地铁客流（不含蓉2号线）
      yearTotal: null,        // 年日均全网客运量
      yearPure: null,         // 年日均纯地铁客流
      monthDays: 0,           // 月有效数据天数
      yearDays: 0,            // 年有效数据天数
      loading: false,
      monthDailyData: []      // 当月每日详细数据，用于绘制折线图
    },
    // 日均数据展开状态
    showDailyAverage: false,
    // 日均数据类型：'month' 月日均 或 'year' 年日均 或 null（未选择）
    dailyAverageType: null
  },

  onLoad(options) {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const yesterdayStr = this.formatDate(yesterday)
    
    // 检查是否从分享链接打开，优先使用分享的日期
    let targetDate = yesterdayStr
    if (options && options.date) {
      // 验证日期格式是否有效
      const sharedDate = new Date(options.date)
      if (!isNaN(sharedDate.getTime())) {
        targetDate = options.date
        console.log('从分享链接打开，使用分享日期:', targetDate)
      }
    } else {
      console.log('设置日期（默认昨天）:', yesterdayStr)
    }
    
    this.setData({
      currentDate: yesterdayStr,  // 限制最大日期为昨天
      selectedDate: targetDate
    })
    this.queryPassengerData(targetDate)
    
    // 检查是否需要显示版本更新提示
    this.checkVersionTip()
  },
  
  // 检查并显示版本更新提示
  checkVersionTip() {
    const versionKey = 'version_tip_2.2.3_shown'
    const hasShown = wx.getStorageSync(versionKey)
    if (!hasShown) {
      this.setData({ showVersionTip: true })
      wx.setStorageSync(versionKey, true)
    }
  },
  
  // 关闭版本更新提示
  closeVersionTip() {
    this.setData({ showVersionTip: false })
  },

  // 打开管理页面（长按Logo触发）
  openAdminPage() {
    wx.navigateTo({
      url: '/pages/admin/index'
    })
  },

  onReady() {
    // 获取设备信息用于canvas适配
    const deviceInfo = wx.getDeviceInfo()
    const windowInfo = wx.getWindowInfo()
    this.pixelRatio = deviceInfo.pixelRatio || windowInfo.pixelRatio || 1
    this.screenWidth = windowInfo.windowWidth
  },

  onShow() {
    // 页面显示时，如果当前在历史榜单tab，则重新获取最新数据
    if (this.data.activeTab === 'top10') {
      this.queryTop10Data()
    }
  },

  // 分享给好友
  onShareAppMessage() {
    const { selectedDate, passengerData } = this.data
    let title = '成都地铁客流查询'
    if (passengerData && passengerData.totalPassengerDisplay) {
      title = `${selectedDate} 成都地铁客流 ${passengerData.totalPassengerDisplay} 万人次`
    }
    return {
      title: title,
      path: `/pages/index/index?date=${selectedDate}`,
      imageUrl: '' // 可以设置分享图片，留空则使用默认截图
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { selectedDate, passengerData } = this.data
    let title = '成都地铁客流查询'
    if (passengerData && passengerData.totalPassengerDisplay) {
      title = `${selectedDate} 客流 ${passengerData.totalPassengerDisplay} 万`
    }
    return {
      title: title,
      query: `date=${selectedDate}`,
      imageUrl: ''
    }
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  onDateChange(e) {
    console.log('日期选择触发:', e.detail.value)
    const selectedDate = e.detail.value
    this.setData({ selectedDate, weekData: [] })
    this.queryPassengerData(selectedDate)
  },

  // 手动打开日期选择器（备用方案）
  openDatePicker() {
    const that = this
    wx.showModal({
      title: '输入日期',
      editable: true,
      placeholderText: 'YYYY-MM-DD',
      content: this.data.selectedDate,
      success(res) {
        if (res.confirm && res.content) {
          const datePattern = /^\d{4}-\d{2}-\d{2}$/
          if (datePattern.test(res.content)) {
            that.setData({ selectedDate: res.content, weekData: [] })
            that.queryPassengerData(res.content)
          } else {
            wx.showToast({ title: '日期格式错误', icon: 'none' })
          }
    }
  }
    })
  },

  normalizeRecord(record) {
    const normalized = {}
    for (const key in record) {
      const standardKey = FIELD_MAP[key] || key
      normalized[standardKey] = record[key]
    }
    return normalized
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    
    // 如果点击的是"昨日客流"标签
    if (tab === 'daily' && this.data.activeTab === 'daily') {
      // 切换下拉菜单（无论是否选择了日均类型）
      this.toggleDailyAverageMenu()
      return
    }
    
    this.setData({ 
      activeTab: tab,
      showDailyAverage: false, // 切换标签时关闭下拉菜单
      dailyAverageType: null // 重置选择
    })
    
    if (tab === 'weekly') {
      this.queryWeekData()
    } else if (tab === 'compare') {
      // 切换到对比标签时，如果有自定义日期则查询，否则只显示日期选择器
      if (this.data.compareCustomDate) {
        this.queryCompareData()
  }
    } else if (tab === 'top10') {
      this.queryTop10Data()
      } else if (tab === 'daily' && this.data.lineList.length > 0) {
      // 切换回昨日客流标签时重新绘制图表
      wx.nextTick(() => {
        setTimeout(() => {
          this.drawBarChart()
        }, 300)
      })
  }
  },

  // 从记录中提取totalPassenger值（兼容多种字段名格式）
  // 获取蓉2号线客流
  getLineRong2Passenger(record) {
    const possibleFields = ['lineRong2', 'lineRong2(number)', 'rong2', 'Rong2']
    for (const field of possibleFields) {
      if (record[field] !== undefined && record[field] !== null && record[field] !== '') {
        return parseFloat(record[field])
      }
    }
    return 0
  },
  
  // 获取纯地铁客流（优先使用 pureMetroPassenger 字段，否则计算）
  getMetroOnlyPassenger(record) {
    // 优先使用数据库中的 pureMetroPassenger 字段（兼容两种字段名格式）
    const pureMetroValue = record['pureMetroPassenger(number)'] || record.pureMetroPassenger
    if (pureMetroValue !== undefined && pureMetroValue !== null && pureMetroValue !== '') {
      return parseFloat(pureMetroValue)
    }
    // 降级计算：总客流 - 蓉2号线
    const total = this.getTotalPassenger(record)
    const rong2 = this.getLineRong2Passenger(record)
    return total - rong2
  },
  
  // 根据榜单类型获取客流数值
  getPassengerByType(record, type) {
    if (type === 'metro') {
      return this.getMetroOnlyPassenger(record)
    }
    return this.getTotalPassenger(record)
  },

  getTotalPassenger(record) {
    // 尝试所有可能的字段名
    const possibleFields = [
      'totalPassenger',
      'totalPassenger(number)',
      'total_passenger',
      'TotalPassenger'
    ]
    
    for (const field of possibleFields) {
      if (record[field] !== undefined && record[field] !== null && record[field] !== '') {
        return parseFloat(record[field])
    }
  }
    
    // 遍历所有字段，查找包含 totalPassenger 的字段名
    for (const key in record) {
      if (key.toLowerCase().includes('totalpassenger')) {
        const val = record[key]
        if (val !== undefined && val !== null && val !== '') {
          return parseFloat(val)
    }
  }
    }
    
    return 0
  },

  // 切换历史前十榜单类型
  switchTop10Type(e) {
    const type = e.currentTarget.dataset.type
    if (type !== this.data.top10Type) {
      this.setData({ top10Type: type })
      this.queryTop10Data()
    }
  },

  // 查询历史前十数据
  async queryTop10Data() {
    this.setData({ top10Loading: true })
    
    const type = this.data.top10Type
    console.log('正在获取历史前十数据，类型:', type === 'metro' ? '纯地铁客流' : '全网客运量')
    
    if (type === 'total') {
      // 全网客运量：使用数据库聚合查询（快速）
      await this.queryTop10ByAggregation()
    } else {
      // 纯地铁客流：直接使用 pureMetroPassenger 字段进行聚合查询（快速）
      await this.queryTop10MetroByAggregation()
    }
  },
  
  // 使用聚合查询获取全网客运量前十（快速）
  async queryTop10ByAggregation() {
    try {
      const db = app.globalData.db
      
      const res = await db.collection('passenger_data_update')
        .aggregate()
        .match({
          'totalPassenger(number)': db.command.gt(0)
        })
        .sort({
          'totalPassenger(number)': -1
        })
        .limit(10)
        .end()
      
      if (res.list && res.list.length > 0) {
        const top10List = res.list.map((record, index) => {
          const normalized = this.normalizeRecord(record)
          const date = normalized.date || record.date || record['date(date)'] || ''
          const dateStr = typeof date === 'string' ? date : String(date)
          const holiday = getHolidayInfo(dateStr)
          return {
            rank: index + 1,
            date: dateStr,
            weekday: normalized.weekday || record.weekday || '',
            dayType: normalized.dayType || record.dayType || '',
            lunarDate: normalized.lunarDate || record.lunarDate || '',
            weather: normalized.weather || record.weather || '',
            maxTemp: normalized.maxTemp || record.maxTemp || null,
            minTemp: normalized.minTemp || record.minTemp || null,
            restrictedPlate: normalized.restrictedPlate || record.restrictedPlate || '',
            totalPassenger: this.getTotalPassenger(record).toFixed(2),
            holiday: holiday
          }
        })
        this.setData({ top10List, top10Loading: false })
      } else {
        this.setData({ top10List: [], top10Loading: false })
      }
    } catch (err) {
      console.error('聚合查询失败:', err)
      this.setData({ top10List: [], top10Loading: false })
    }
  },
  
  // 使用聚合查询获取纯地铁客流前十（快速，直接使用 pureMetroPassenger 字段）
  async queryTop10MetroByAggregation() {
    try {
      const db = app.globalData.db
      
      const res = await db.collection('passenger_data_update')
        .aggregate()
        .match({
          'pureMetroPassenger(number)': db.command.gt(0)
        })
        .sort({
          'pureMetroPassenger(number)': -1
        })
        .limit(10)
        .end()
      
      if (res.list && res.list.length > 0) {
        const top10List = res.list.map((record, index) => {
          const normalized = this.normalizeRecord(record)
          const date = normalized.date || record.date || record['date(date)'] || ''
          const dateStr = typeof date === 'string' ? date : String(date)
          const holiday = getHolidayInfo(dateStr)
          // 使用 pureMetroPassenger 字段作为客流数值（兼容两种字段名格式）
          const pureMetroPassenger = record['pureMetroPassenger(number)'] || record.pureMetroPassenger || normalized.pureMetroPassenger || this.getMetroOnlyPassenger(record)
          return {
            rank: index + 1,
            date: dateStr,
            weekday: normalized.weekday || record.weekday || '',
            dayType: normalized.dayType || record.dayType || '',
            lunarDate: normalized.lunarDate || record.lunarDate || '',
            weather: normalized.weather || record.weather || '',
            maxTemp: normalized.maxTemp || record.maxTemp || null,
            minTemp: normalized.minTemp || record.minTemp || null,
            restrictedPlate: normalized.restrictedPlate || record.restrictedPlate || '',
            totalPassenger: parseFloat(pureMetroPassenger).toFixed(2),
            holiday: holiday
          }
        })
        this.setData({ top10List, top10Loading: false })
      } else {
        this.setData({ top10List: [], top10Loading: false })
      }
    } catch (err) {
      console.error('纯地铁客流聚合查询失败:', err)
      console.error('错误详情:', JSON.stringify(err, null, 2))
      this.setData({ top10List: [], top10Loading: false })
    }
  },
  
  
  // 点击历史榜单项
  onTop10ItemTap(e) {
    const date = e.currentTarget.dataset.date
    if (date) {
      this.openDetailModal(date)
  }
  },

  // 打开详情模态框
  async openDetailModal(date) {
    this.setData({
      showDetailModal: true,
      detailModalLoading: true,
      detailModalData: {
        date: date,
        passengerData: null,
        lineList: []
  }
    })

    try {
      const db = app.globalData.db
      let res = await db.collection('passenger_data_update')
        .where({ date: date })
        .get()

      if (!res.data || res.data.length === 0) {
        // 尝试使用 date() 函数查询
        res = await db.collection('passenger_data_update')
          .where({ 'date(date)': date })
          .get()
      }

      if (res.data && res.data.length > 0) {
        const record = this.normalizeRecord(res.data[0])
        const lineList = []
        
        // 按照 LINE_ORDER 的顺序处理
        LINE_ORDER.forEach(lineKey => {
          const passenger = record[lineKey]
          if (passenger !== undefined && passenger !== null && passenger !== '' && parseFloat(passenger) > 0) {
            const lineInfo = LINE_COLORS[lineKey]
            if (lineInfo) {
              const passengerValue = parseFloat(passenger)
              lineList.push({
                key: lineKey,
                name: lineInfo.name,
                color: lineInfo.color,
                passenger: passengerValue,
                displayPassenger: passengerValue.toFixed(2)
              })
    }
  }
        })

        // 按客流量降序排序
        lineList.sort((a, b) => b.passenger - a.passenger)

        // 格式化总客流量
        if (record.totalPassenger !== undefined && record.totalPassenger !== null) {
          const totalPassengerValue = parseFloat(record.totalPassenger)
          record.totalPassengerDisplay = totalPassengerValue.toFixed(2)
          record.totalPassenger = totalPassengerValue
        }

        // 计算纯地铁客流（优先使用数据库字段，否则用总客流减去蓉2号线）
        const rong2Passenger = this.getLineRong2Passenger(record)
        const totalPassengerValue = record.totalPassenger || 0
        let metroOnlyPassenger
        const pureMetroValue = record.pureMetroPassenger
        if (pureMetroValue !== undefined && pureMetroValue !== null && pureMetroValue !== '') {
          metroOnlyPassenger = parseFloat(pureMetroValue)
        } else {
          metroOnlyPassenger = Math.max(0, totalPassengerValue - rong2Passenger)
        }
        record.metroOnlyPassenger = metroOnlyPassenger
        record.metroOnlyPassengerDisplay = metroOnlyPassenger.toFixed(2)

        this.setData({
          detailModalLoading: false,
          detailModalData: {
            date: date,
            passengerData: record,
            lineList: lineList
  }
        })
      } else {
        this.setData({
          detailModalLoading: false,
          detailModalData: {
            date: date,
            passengerData: null,
            lineList: []
  }
        })
        wx.showToast({
          title: '未找到该日期的数据',
          icon: 'none'
        })
  }
    } catch (err) {
      console.error('查询详情失败:', err)
      this.setData({
        detailModalLoading: false
      })
      wx.showToast({
        title: '查询失败，请重试',
        icon: 'none'
      })
  }
  },

  // 关闭详情模态框
  closeDetailModal() {
    this.setData({
      showDetailModal: false
    })
  },

  // 阻止事件冒泡（防止点击内容区域关闭模态框）
  preventClose() {
    // 空函数，仅用于阻止事件冒泡
  },

  async queryPassengerData(date) {
    this.setData({ loading: true, errorMsg: '', hasData: false })

    try {
      const db = app.globalData.db
      
      let res = await db.collection('passenger_data_update')
        .where({ date: date })
        .get()

      if (!res.data || res.data.length === 0) {
        res = await db.collection('passenger_data_update')
          .where({ 'date(date)': date })
          .get()
      }

      if (res.data && res.data.length > 0) {
        const record = this.normalizeRecord(res.data[0])
        this.processData(record)
        // processData 内部会在 setData 回调中绘制图表
      } else {
        this.setData({
          loading: false,
          hasData: false,
          errorMsg: `${date} 暂无客流数据`,
          lineList: [],
          passengerData: null
        })
  }
    } catch (err) {
      console.error('查询失败:', err)
      this.setData({
        loading: false,
        hasData: false,
        errorMsg: '查询失败，请检查网络或数据库配置',
        lineList: [],
        passengerData: null
      })
  }
  },

  processData(record) {
    const lineList = []
    let rong2Passenger = 0 // 记录蓉2号线的客流量
    
    // 按照 LINE_ORDER 的顺序处理，保持线路顺序
    LINE_ORDER.forEach(lineKey => {
      const passenger = record[lineKey]
      if (passenger !== undefined && passenger !== null && passenger !== '' && parseFloat(passenger) > 0) {
        const lineInfo = LINE_COLORS[lineKey]
        if (lineInfo) {
          const passengerValue = parseFloat(passenger)
          lineList.push({
            key: lineKey,
          name: lineInfo.name,
          color: lineInfo.color,
            passenger: passengerValue, // 保留数值类型用于计算
            displayPassenger: passengerValue.toFixed(2) // 添加显示用的字符串类型
          })
          
          // 记录蓉2号线的客流量
          if (lineKey === 'lineRong2') {
            rong2Passenger = passengerValue
          }
    }
  }
    })
  
    // 按客流量降序排序（列表显示时使用）
    lineList.sort((a, b) => b.passenger - a.passenger)

    // 格式化总客流量为两位小数（用于显示），保留原始值用于计算
    if (record.totalPassenger !== undefined && record.totalPassenger !== null) {
      const totalPassengerValue = parseFloat(record.totalPassenger)
      record.totalPassengerDisplay = totalPassengerValue.toFixed(2)
      record.totalPassenger = totalPassengerValue // 保持数值类型
    }

    // 优先使用数据库中的 pureMetroPassenger 字段，否则计算（总客流减去蓉2号线）
    const totalPassengerValue = record.totalPassenger || 0
    let metroOnlyPassenger
    const pureMetroValue = record.pureMetroPassenger
    if (pureMetroValue !== undefined && pureMetroValue !== null && pureMetroValue !== '') {
      metroOnlyPassenger = parseFloat(pureMetroValue)
    } else {
      metroOnlyPassenger = Math.max(0, totalPassengerValue - rong2Passenger)
    }
    record.metroOnlyPassenger = metroOnlyPassenger
    record.metroOnlyPassengerDisplay = metroOnlyPassenger.toFixed(2)

    this.setData({
      loading: false,
      hasData: true,
      passengerData: record,
      lineList: lineList
    }, () => {
      // 数据设置完成后绘制图表
      // 使用 wx.nextTick 确保 DOM 更新完成
      if (this.data.activeTab === 'daily' && lineList.length > 0) {
        wx.nextTick(() => {
          setTimeout(() => {
            this.drawBarChart()
          }, 300)
        })
  }
    })
  },

  // 切换日均数据下拉菜单
  toggleDailyAverageMenu() {
    const showDailyAverage = !this.data.showDailyAverage
    this.setData({ showDailyAverage })
  },

  // 选择数据类型（昨日客流、月日均、年日均）
  selectDailyAverageType(e) {
    const type = e.currentTarget.dataset.type // 'daily'、'month' 或 'year'
    
    if (type === 'daily') {
      // 返回昨日客流
      this.setData({
        dailyAverageType: null,
        showDailyAverage: false
      })
    } else {
      // 选择月日均或年日均
      this.setData({
        dailyAverageType: type,
        showDailyAverage: false, // 选择后关闭菜单
        // 重置数据
        'dailyAverageData.monthTotal': null,
        'dailyAverageData.monthPure': null,
        'dailyAverageData.monthDays': 0,
        'dailyAverageData.yearTotal': null,
        'dailyAverageData.yearPure': null,
        'dailyAverageData.yearDays': 0
      })
      
      // 查询对应类型的数据
      this.queryDailyAverageData(type)
    }
  },

  // 查询月日均和年日均客流数据
  async queryDailyAverageData(type = null) {
    const selectedDate = this.data.selectedDate
    if (!selectedDate) return

    // 解析选中日期
    const dateParts = selectedDate.split('-')
    const year = dateParts[0]
    const month = dateParts[1]
    const day = parseInt(dateParts[2])

    // 设置加载状态
    this.setData({
      'dailyAverageData.loading': true
    })

    try {
      const db = app.globalData.db

      // 构建月份范围
      const monthStart = `${year}-${month}-01`
      const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1
      const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year)
      const nextMonthStr = String(nextMonth).padStart(2, '0')
      const monthEnd = `${nextYear}-${nextMonthStr}-01`

      // 构建年份范围
      const yearStart = `${year}-01-01`
      const yearEnd = `${parseInt(year) + 1}-01-01`

      console.log('查询日均数据，选中日期:', selectedDate, '月份范围:', monthStart, '-', monthEnd, '年份范围:', yearStart, '-', yearEnd)

      // 根据选择的类型查询数据
      const targetType = type || this.data.dailyAverageType
      
      let monthTotal = null, monthPure = null, monthDays = 0
      let yearTotal = null, yearPure = null, yearDays = 0
      let monthDailyData = [] // 存储每日详细数据，用于绘制折线图

      // 只查询选中的类型
      if (targetType === 'month') {
        // 生成月份日期列表（从1号到选中日期）
        const monthDates = []
        for (let d = 1; d <= day; d++) {
          monthDates.push(`${year}-${month}-${String(d).padStart(2, '0')}`)
        }

        console.log('查询月日均，日期数:', monthDates.length)

        // 批量查询月数据
        let monthData = []
        const batchSize = 20
        for (let i = 0; i < monthDates.length; i += batchSize) {
          const batch = monthDates.slice(i, i + batchSize)
          let res = await db.collection('passenger_data_update')
            .where({ date: db.command.in(batch) })
            .get()
          
          if (!res.data || res.data.length === 0) {
            res = await db.collection('passenger_data_update')
              .where({ 'date(date)': db.command.in(batch) })
              .get()
          }
          
          if (res.data && res.data.length > 0) {
            monthData = monthData.concat(res.data)
          }
        }

        console.log('月数据查询结果:', monthData.length, '条')

        // 处理月数据
        if (monthData.length > 0) {
          let totalSum = 0, pureSum = 0, validCount = 0
          monthData.forEach(record => {
            const normalized = this.normalizeRecord(record)
            const total = this.getTotalPassenger(record)
            const pure = this.getMetroOnlyPassenger(record)
            if (total > 0) {
              totalSum += total
              pureSum += pure
              validCount++
              
              // 保存每日数据用于折线图
              const recordDate = String(normalized.date || '').substring(0, 10)
              monthDailyData.push({
                date: recordDate,
                shortDate: recordDate.slice(5), // MM-DD
                day: parseInt(recordDate.slice(8)), // 日期数字
                total: total,
                pure: pure,
                weekday: normalized.weekday || ''
              })
            }
          })
          
          // 按日期排序
          monthDailyData.sort((a, b) => a.date.localeCompare(b.date))
          
          if (validCount > 0) {
            monthDays = validCount
            monthTotal = (totalSum / validCount).toFixed(2)
            monthPure = (pureSum / validCount).toFixed(2)
          }
        }
      } else if (targetType === 'year') {
        // 生成年份日期列表（从1月1日到选中日期）
        const yearDates = []
        const selectedDateObj = new Date(selectedDate)
        const yearStartObj = new Date(yearStart)
        for (let d = new Date(yearStartObj); d <= selectedDateObj; d.setDate(d.getDate() + 1)) {
          yearDates.push(this.formatDate(new Date(d)))
        }

        console.log('查询年日均，日期数:', yearDates.length)

        // 批量查询年数据
        let yearData = []
        const batchSize = 20
        for (let i = 0; i < yearDates.length; i += batchSize) {
          const batch = yearDates.slice(i, i + batchSize)
          let res = await db.collection('passenger_data_update')
            .where({ date: db.command.in(batch) })
            .get()
          
          if (!res.data || res.data.length === 0) {
            res = await db.collection('passenger_data_update')
              .where({ 'date(date)': db.command.in(batch) })
              .get()
          }
          
          if (res.data && res.data.length > 0) {
            yearData = yearData.concat(res.data)
          }
        }

        console.log('年数据查询结果:', yearData.length, '条')

        // 处理年数据
        if (yearData.length > 0) {
          let totalSum = 0, pureSum = 0, validCount = 0
          yearData.forEach(record => {
            const total = this.getTotalPassenger(record)
            const pure = this.getMetroOnlyPassenger(record)
            if (total > 0) {
              totalSum += total
              pureSum += pure
              validCount++
            }
          })
          if (validCount > 0) {
            yearDays = validCount
            yearTotal = (totalSum / validCount).toFixed(2)
            yearPure = (pureSum / validCount).toFixed(2)
          }
        }
      }

      console.log('日均数据计算完成:', { monthTotal, monthPure, monthDays, yearTotal, yearPure, yearDays })

      this.setData({
        dailyAverageData: {
          monthTotal,
          monthPure,
          yearTotal,
          yearPure,
          monthDays,
          yearDays,
          loading: false,
          debugDates: null,
          totalCount: 0,
          monthDailyData: monthDailyData || []
        }
      }, () => {
        // 数据设置完成后，如果是月日均类型，绘制折线图
        if (targetType === 'month' && monthDailyData.length > 0) {
          wx.nextTick(() => {
            setTimeout(() => {
              this.drawMonthDailyLineChart()
            }, 300)
          })
        }
      })

    } catch (err) {
      console.error('查询日均客流数据失败:', err)
      this.setData({
        'dailyAverageData.loading': false
      })
    }
  },

  // 查询7日数据
  async queryWeekData() {
    if (this.data.weekData.length > 0) {
      wx.nextTick(() => {
        setTimeout(() => {
          this.drawLineChart()
          setTimeout(() => this.drawWeekBarChart(), 350)
        }, 300)
      })
      return
    }

    this.setData({ loading: true })

    try {
      const db = app.globalData.db
      const endDate = new Date(this.data.selectedDate)
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 6)

      const dates = []
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(this.formatDate(new Date(d)))
      }

      const weekData = []
      for (const date of dates) {
        let res = await db.collection('passenger_data_update')
          .where({ date: date })
          .get()

        if (!res.data || res.data.length === 0) {
          res = await db.collection('passenger_data_update')
            .where({ 'date(date)': date })
            .get()
        }

        if (res.data && res.data.length > 0) {
          const record = this.normalizeRecord(res.data[0])
          const totalPassenger = parseFloat(record.totalPassenger) || 0
          weekData.push({
            date: date,
            shortDate: date.slice(5),
            weekday: record.weekday || '',
            totalPassenger: parseFloat(totalPassenger.toFixed(2)),
            totalPassengerDisplay: totalPassenger.toFixed(2)
          })
    }
  }

      this.setData({ weekData, loading: false }, () => {
        wx.nextTick(() => {
          setTimeout(() => {
            this.drawLineChart()
            setTimeout(() => this.drawWeekBarChart(), 350)
          }, 300)
        })
      })
    } catch (err) {
      console.error('查询7日数据失败:', err)
      this.setData({ loading: false })
  }
  },

  // 自定义日期选择变化
  onCompareDateChange(e) {
    const date = e.detail.value
    this.setData({ compareCustomDate: date })
    if (date) {
      this.queryCompareData()
  }
  },

  // 查询对比数据（当天和自定义日期）
  async queryCompareData() {
    if (!this.data.compareCustomDate) {
      // 如果没有选择自定义日期，不查询
      return
    }

    this.setData({ compareLoading: true })

    try {
      const db = app.globalData.db
      const currentDate = this.data.selectedDate
      const customDate = this.data.compareCustomDate

      const datesToQuery = [
        { key: 'current', date: currentDate },
        { key: 'custom', date: customDate }
      ]

      const compareData = {
        current: null,
        custom: null
      }

      for (const item of datesToQuery) {
        let res = await db.collection('passenger_data_update')
          .where({ date: item.date })
          .get()

        if (!res.data || res.data.length === 0) {
          res = await db.collection('passenger_data_update')
            .where({ 'date(date)': item.date })
            .get()
        }

        if (res.data && res.data.length > 0) {
          const record = this.normalizeRecord(res.data[0])
          const totalPassenger = parseFloat(record.totalPassenger) || 0
          const dateShort = item.date.slice(5) // MM-DD格式
          compareData[item.key] = {
            date: item.date,
            dateShort: dateShort,
            weekday: record.weekday || '',
            dayType: record.dayType || '',
            lunarDate: record.lunarDate || '',
            totalPassenger: parseFloat(totalPassenger.toFixed(2)),
            totalPassengerDisplay: totalPassenger.toFixed(2),
            weather: record.weather || '',
            maxTemp: record.maxTemp !== null && record.maxTemp !== undefined ? record.maxTemp : null,
            minTemp: record.minTemp !== null && record.minTemp !== undefined ? record.minTemp : null,
            restrictedPlate: record.restrictedPlate || ''
    }
  }
      }

      // 计算变化百分比
      if (compareData.current && compareData.custom) {
        const currentValue = compareData.current.totalPassenger
        const customValue = compareData.custom.totalPassenger
        const change = this.calcChange(currentValue, customValue)
        compareData.custom.change = {
          value: change !== null ? Math.abs(change) : 0,
          isUp: change !== null && change >= 0,
          absolute: Math.abs(currentValue - customValue).toFixed(2)
    }
  }

      this.setData({ compareData, compareLoading: false }, () => {
        wx.nextTick(() => {
          setTimeout(() => this.drawCompareChart(), 300)
        })
      })
    } catch (err) {
      console.error('查询对比数据失败:', err)
      this.setData({ compareLoading: false })
  }
  },

  // 绘制对比柱状图
  drawCompareChart(retryCount = 0) {
    const compareData = this.data.compareData
    if (!compareData || !compareData.current) {
      console.log('drawCompareChart: compareData为空，无法绘制图表')
      return
    }

    // 最多重试5次
    if (retryCount > 5) {
      console.error('drawCompareChart: 重试次数过多，放弃绘制')
      return
    }

    console.log('drawCompareChart: 开始绘制图表，重试次数:', retryCount)

    const query = wx.createSelectorQuery().in(this)
    query.select('#compareChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        console.log('drawCompareChart: query结果', res)
        
        if (!res || !res[0]) {
          console.error('drawCompareChart: 无法获取canvas元素，200ms后重试...')
          setTimeout(() => this.drawCompareChart(retryCount + 1), 200)
          return
        }
        
        const canvas = res[0].node
        if (!canvas) {
          console.error('drawCompareChart: canvas节点为空，200ms后重试...')
          setTimeout(() => this.drawCompareChart(retryCount + 1), 200)
          return
        }
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.error('drawCompareChart: 无法获取canvas上下文，200ms后重试...')
          setTimeout(() => this.drawCompareChart(retryCount + 1), 200)
          return
        }
        
        const windowInfo = wx.getWindowInfo()
        const deviceInfo = wx.getDeviceInfo()
        const dpr = deviceInfo.pixelRatio || windowInfo.pixelRatio || 1
        const width = (res[0].width && res[0].width > 0) ? res[0].width : (690 / 750 * windowInfo.windowWidth)
        const height = (res[0].height && res[0].height > 0) ? res[0].height : (450 / 750 * windowInfo.windowWidth)
        
        console.log('drawCompareChart: canvas尺寸', width, height, 'dpr:', dpr)
        
        // 设置Canvas物理尺寸 - 设置后会自动清空画布和重置变换
        canvas.width = Math.floor(width * dpr)
        canvas.height = Math.floor(height * dpr)
        
        ctx.scale(dpr, dpr)
        
        // 绘制纯白背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        
        // 准备数据 - 定义渐变色
        const barData = []
        const colorSets = {
          current: { start: '#3b82f6', end: '#1d4ed8', label: '#3b82f6' },  // 蓝色渐变
          custom: { start: '#22c55e', end: '#15803d', label: '#22c55e' }    // 绿色渐变
        }
        
        if (compareData.current) {
          barData.push({ 
            label: '当天', 
            value: compareData.current.totalPassenger, 
            colorSet: colorSets.current,
            date: compareData.current.dateShort || compareData.current.date.slice(5)
          })
        }
        if (compareData.custom) {
          barData.push({ 
            label: '对比', 
            value: compareData.custom.totalPassenger, 
            colorSet: colorSets.custom,
            date: compareData.custom.dateShort || compareData.custom.date.slice(5)
          })
        }
        
        if (barData.length === 0) return
        
        // 图表参数 - 优化布局
        const padding = { top: 55, right: 50, bottom: 75, left: 60 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom
        
        const values = barData.map(item => item.value)
        const maxValue = Math.max(...values)
        const minValue = Math.min(...values)
        
        // 优化：Y轴不从0开始，让柱子差异更明显
        const yAxisMin = Math.floor(minValue * 0.85 / 50) * 50
        const yAxisMax = Math.ceil(maxValue * 1.05 / 50) * 50
        const yAxisRange = yAxisMax - yAxisMin
        const yAxisStep = yAxisRange / 5
        
        const totalBars = barData.length
        
        // 计算柱子宽度和间距，让两个柱子居中显示
        const barWidth = chartWidth * 0.28
        const totalGap = chartWidth - (barWidth * totalBars)
        const gap = totalGap / (totalBars + 1)
        
        // 绘制Y轴刻度和虚线网格
        ctx.fillStyle = '#64748b'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        
        for (let i = 0; i <= 5; i++) {
          const y = padding.top + chartHeight * (1 - i / 5)
          const value = Math.round(yAxisMin + yAxisStep * i)
          
          // 绘制虚线网格
          ctx.strokeStyle = '#e2e8f0'
          ctx.lineWidth = 1
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(padding.left, y)
          ctx.lineTo(width - padding.right, y)
          ctx.stroke()
          ctx.setLineDash([])
          
          // 绘制Y轴刻度值
          ctx.fillText(value.toString(), padding.left - 12, y)
        }
        
        // 绘制柱状图
        barData.forEach((item, index) => {
          const x = padding.left + gap + index * (barWidth + gap)
          // 使用优化后的Y轴范围计算柱子高度
          const barHeight = ((item.value - yAxisMin) / yAxisRange) * chartHeight
          const y = height - padding.bottom - barHeight
          const colorSet = item.colorSet
          
          // 绘制柱子阴影
          ctx.save()
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
          ctx.shadowBlur = 12
          ctx.shadowOffsetX = 3
          ctx.shadowOffsetY = 6
          
          // 绘制圆角柱子（渐变填充）
          const barGradient = ctx.createLinearGradient(x, y, x, y + barHeight)
          barGradient.addColorStop(0, colorSet.start)
          barGradient.addColorStop(1, colorSet.end)
          ctx.fillStyle = barGradient
          
          // 圆角矩形
          const radius = 10
          ctx.beginPath()
          ctx.moveTo(x + radius, y)
          ctx.lineTo(x + barWidth - radius, y)
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
          ctx.lineTo(x + barWidth, y + barHeight)
          ctx.lineTo(x, y + barHeight)
          ctx.lineTo(x, y + radius)
          ctx.quadraticCurveTo(x, y, x + radius, y)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
          
          // 绘制数值标签（带背景的标签）
          const valueText = item.value.toFixed(2)
          ctx.font = 'bold 13px sans-serif'
          const textWidth = ctx.measureText(valueText).width
          
          // 绘制标签背景
          ctx.fillStyle = colorSet.start
          const labelPadding = 8
          const labelWidth = textWidth + labelPadding * 2
          const labelHeight = 24
          const labelX = x + barWidth / 2 - labelWidth / 2
          const labelY = y - labelHeight - 10
          
          ctx.beginPath()
          ctx.moveTo(labelX + 6, labelY)
          ctx.lineTo(labelX + labelWidth - 6, labelY)
          ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + 6)
          ctx.lineTo(labelX + labelWidth, labelY + labelHeight - 6)
          ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - 6, labelY + labelHeight)
          ctx.lineTo(labelX + 6, labelY + labelHeight)
          ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - 6)
          ctx.lineTo(labelX, labelY + 6)
          ctx.quadraticCurveTo(labelX, labelY, labelX + 6, labelY)
          ctx.closePath()
          ctx.fill()
          
          // 绘制数值文本
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(valueText, x + barWidth / 2, labelY + labelHeight / 2)
          
          // 绘制X轴标签
          ctx.fillStyle = colorSet.label
          ctx.font = 'bold 14px sans-serif'
          ctx.textBaseline = 'top'
          ctx.fillText(item.label, x + barWidth / 2, height - padding.bottom + 15)
          
          // 绘制日期
          ctx.fillStyle = '#64748b'
          ctx.font = '12px sans-serif'
          const dateStr = item.date.length > 5 ? item.date.slice(5) : item.date
          ctx.fillText(dateStr, x + barWidth / 2, height - padding.bottom + 38)
        })
        
        // 绘制标题
        ctx.fillStyle = '#1e293b'
        ctx.font = 'bold 15px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('客流量同期对比（万人次）', width / 2, 28)
        
        console.log('drawCompareChart: 图表绘制完成，共绘制', barData.length, '个柱子')
      })
  },

  // 计算同比/环比变化
  calcChange(current, compare) {
    if (!current || !compare || compare === 0) return null
    return ((current - compare) / compare * 100).toFixed(2)
  },

  // 点击放大柱状图
  openBarChartFullscreen() {
    if (!this.data.lineList || this.data.lineList.length === 0) return
    this.setData({ showBarChartFullscreen: true }, () => {
      wx.nextTick(() => {
        setTimeout(() => {
          this.drawBarChart({ canvasId: 'barChartFull', showValues: true })
        }, 200)
      })
    })
  },

  // 关闭放大柱状图
  closeBarChartFullscreen() {
    this.setData({ showBarChartFullscreen: false })
  },

  // 生成分享长图
  generateLongImage() {
    if (this.data.generatingImage) return
    
    const { passengerData, lineList, selectedDate } = this.data
    if (!passengerData || !lineList || lineList.length === 0) {
      wx.showToast({ title: '暂无数据可生成', icon: 'none' })
      return
    }

    this.setData({ generatingImage: true })
    wx.showLoading({ title: '正在生成...', mask: true })

    // 先检查隐私协议和权限
    this.checkPrivacyAndPermission(() => {
      this.doGenerateLongImage()
    }, () => {
      this.setData({ generatingImage: false })
      wx.hideLoading()
    })
  },

  // 检查隐私协议和相册权限
  checkPrivacyAndPermission(onSuccess, onFail) {
    // 检查隐私协议
    if (wx.getPrivacySetting) {
      wx.getPrivacySetting({
        success: (privacyRes) => {
          if (privacyRes.needAuthorization) {
            wx.requirePrivacyAuthorize({
              success: () => this.checkAlbumAuth(onSuccess, onFail),
              fail: () => {
                wx.showToast({ title: '需要同意隐私协议', icon: 'none' })
                onFail()
              }
            })
          } else {
            this.checkAlbumAuth(onSuccess, onFail)
          }
        },
        fail: () => this.checkAlbumAuth(onSuccess, onFail)
      })
    } else {
      this.checkAlbumAuth(onSuccess, onFail)
    }
  },

  // 检查相册权限
  checkAlbumAuth(onSuccess, onFail) {
    wx.getSetting({
      success: (res) => {
        const hasAuth = res.authSetting['scope.writePhotosAlbum']
        if (hasAuth === true) {
          onSuccess()
        } else if (hasAuth === false) {
          wx.showModal({
            title: '需要相册权限',
            content: '保存图片需要您授权访问相册，请在设置中开启',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting({
                  success: (openRes) => {
                    if (openRes.authSetting['scope.writePhotosAlbum']) {
                      onSuccess()
                    } else {
                      onFail()
                    }
                  }
                })
              } else {
                onFail()
              }
            }
          })
        } else {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => onSuccess(),
            fail: () => {
              wx.showModal({
                title: '需要相册权限',
                content: '保存图片需要您授权访问相册',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting({
                      success: (openRes) => {
                        if (openRes.authSetting['scope.writePhotosAlbum']) {
                          onSuccess()
                        } else {
                          onFail()
                        }
                      }
                    })
                  } else {
                    onFail()
                  }
                }
              })
            }
          })
        }
      },
      fail: () => onFail()
    })
  },

  // 执行长图生成
  doGenerateLongImage() {
    const { passengerData, lineList, selectedDate } = this.data
    const dpr = wx.getSystemInfoSync().pixelRatio || 2
    
    // 计算画布尺寸
    const canvasWidth = 750
    const lineItemHeight = 90
    const headerHeight = 320
    const infoCardHeight = 180
    const totalCardHeight = 200
    const lineListHeaderHeight = 90
    const footerHeight = 140
    const padding = 40
    
    const canvasHeight = headerHeight + infoCardHeight + totalCardHeight + 
                         lineListHeaderHeight + (lineList.length * lineItemHeight) + 
                         footerHeight + padding * 3

    wx.createSelectorQuery()
      .select('#longImageCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) {
          wx.hideLoading()
          this.setData({ generatingImage: false })
          wx.showToast({ title: '画布初始化失败', icon: 'none' })
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        
        // 设置画布尺寸
        canvas.width = canvasWidth * dpr
        canvas.height = canvasHeight * dpr
        ctx.scale(dpr, dpr)

        // 加载 logo 图片
        const logoImg = canvas.createImage()
        logoImg.src = '/images/logo.png'
        
        logoImg.onload = () => {
          this.drawLongImageContent(ctx, canvas, logoImg, canvasWidth, canvasHeight, {
            passengerData, lineList, selectedDate, padding,
            headerHeight, infoCardHeight, totalCardHeight, lineListHeaderHeight, lineItemHeight
          })
        }
        
        logoImg.onerror = () => {
          // logo 加载失败也继续绘制
          this.drawLongImageContent(ctx, canvas, null, canvasWidth, canvasHeight, {
            passengerData, lineList, selectedDate, padding,
            headerHeight, infoCardHeight, totalCardHeight, lineListHeaderHeight, lineItemHeight
          })
        }
      })
  },

  // 绘制长图内容
  drawLongImageContent(ctx, canvas, logoImg, canvasWidth, canvasHeight, data) {
    const { passengerData, lineList, selectedDate, padding,
            headerHeight, infoCardHeight, totalCardHeight, lineListHeaderHeight, lineItemHeight } = data

    // 绘制背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight)
    gradient.addColorStop(0, '#e8f4fc')
    gradient.addColorStop(0.5, '#f5f8fa')
    gradient.addColorStop(1, '#f0f2f5')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    let y = padding

    // 绘制标题区域背景卡片
    ctx.fillStyle = '#fff'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetY = 4
    this.drawRoundRect(ctx, padding, y, canvasWidth - padding * 2, headerHeight - 40, 24)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    // 绘制 logo
    if (logoImg) {
      const logoSize = 70
      ctx.drawImage(logoImg, canvasWidth / 2 - logoSize / 2, y + 25, logoSize, logoSize)
    }

    // 绘制标题
    ctx.textAlign = 'center'
    ctx.fillStyle = '#1296db'
    ctx.font = 'bold 44px sans-serif'
    ctx.fillText('蓉城客流', canvasWidth / 2, y + 130)
    
    ctx.fillStyle = '#888'
    ctx.font = '26px sans-serif'
    ctx.fillText('成都地铁客流查询', canvasWidth / 2, y + 165)
    
    // 日期
    ctx.fillStyle = '#333'
    ctx.font = 'bold 38px sans-serif'
    ctx.fillText(selectedDate, canvasWidth / 2, y + 220)
    
    // 日期类型、星期
    ctx.fillStyle = '#999'
    ctx.font = '24px sans-serif'
    const infoText = `${passengerData.weekday} · ${passengerData.dayType} · ${passengerData.lunarDate || ''}`
    ctx.fillText(infoText, canvasWidth / 2, y + 255)
    
    y += headerHeight

    // 绘制基本信息卡片
    ctx.fillStyle = '#fff'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)'
    ctx.shadowBlur = 16
    ctx.shadowOffsetY = 3
    this.drawRoundRect(ctx, padding, y, canvasWidth - padding * 2, infoCardHeight - 30, 20)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    
    // 基本信息内容
    const infoItems = [
      { label: '天气', value: `${passengerData.weather || '-'}` },
      { label: '气温', value: `${passengerData.minTemp || '-'}°~${passengerData.maxTemp || '-'}°` },
      { label: '限行', value: passengerData.restrictedPlate || '-' }
    ]
    
    const itemWidth = (canvasWidth - padding * 2) / 3
    infoItems.forEach((item, index) => {
      const x = padding + index * itemWidth + itemWidth / 2
      ctx.textAlign = 'center'
      ctx.fillStyle = '#999'
      ctx.font = '24px sans-serif'
      ctx.fillText(item.label, x, y + 50)
      ctx.fillStyle = '#333'
      ctx.font = 'bold 32px sans-serif'
      ctx.fillText(item.value, x, y + 95)
    })
    
    y += infoCardHeight

    // 绘制总客流卡片
    ctx.shadowColor = 'rgba(100, 140, 170, 0.25)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetY = 6
    const cardGradient = ctx.createLinearGradient(padding, y, canvasWidth - padding, y + totalCardHeight - 30)
    cardGradient.addColorStop(0, '#7a9eb8')
    cardGradient.addColorStop(1, '#5c849e')
    ctx.fillStyle = cardGradient
    this.drawRoundRect(ctx, padding, y, canvasWidth - padding * 2, totalCardHeight - 30, 24)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    
    // 左侧纯地铁客流
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = '26px sans-serif'
    ctx.fillText('纯地铁客流', canvasWidth / 4 + padding / 2, y + 55)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 56px sans-serif'
    ctx.fillText(passengerData.metroOnlyPassengerDisplay || '0.00', canvasWidth / 4 + padding / 2, y + 120)
    ctx.font = '22px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('万人次', canvasWidth / 4 + padding / 2, y + 150)
    
    // 分隔线
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvasWidth / 2, y + 30)
    ctx.lineTo(canvasWidth / 2, y + totalCardHeight - 60)
    ctx.stroke()
    
    // 右侧全网客运量
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = '26px sans-serif'
    ctx.fillText('全网客运量', canvasWidth * 3 / 4 - padding / 2, y + 55)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 56px sans-serif'
    ctx.fillText(passengerData.totalPassengerDisplay || '0.00', canvasWidth * 3 / 4 - padding / 2, y + 120)
    ctx.font = '22px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('万人次', canvasWidth * 3 / 4 - padding / 2, y + 150)
    
    y += totalCardHeight

    // 绘制线路列表标题
    ctx.textAlign = 'left'
    ctx.fillStyle = '#333'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('各线路客流明细', padding + 10, y + 45)
    ctx.fillStyle = '#999'
    ctx.font = '22px sans-serif'
    ctx.fillText('（按客流量降序，单位：万人次）', padding + 220, y + 45)
    
    y += lineListHeaderHeight

    // 绘制线路列表背景卡片
    const listHeight = lineList.length * lineItemHeight
    ctx.fillStyle = '#fff'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)'
    ctx.shadowBlur = 16
    ctx.shadowOffsetY = 3
    this.drawRoundRect(ctx, padding, y - 10, canvasWidth - padding * 2, listHeight + 20, 20)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    // 绘制各线路
    const maxPassenger = lineList[0]?.passenger || 1
    lineList.forEach((item, index) => {
      const itemY = y + index * lineItemHeight
      
      // 分隔线
      if (index > 0) {
        ctx.strokeStyle = '#f0f0f0'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(padding + 20, itemY)
        ctx.lineTo(canvasWidth - padding - 20, itemY)
        ctx.stroke()
      }
      
      // 线路名称徽章
      ctx.fillStyle = item.color
      this.drawRoundRect(ctx, padding + 20, itemY + 25, 100, 42, 10)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 26px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(item.name, padding + 70, itemY + 55)
      
      // 进度条
      const barWidth = 360
      const barX = padding + 145
      ctx.fillStyle = '#f0f0f0'
      this.drawRoundRect(ctx, barX, itemY + 32, barWidth, 28, 14)
      ctx.fill()
      
      const fillWidth = Math.max(28, (item.passenger / maxPassenger) * barWidth)
      ctx.fillStyle = item.color
      this.drawRoundRect(ctx, barX, itemY + 32, fillWidth, 28, 14)
      ctx.fill()
      
      // 客流数值
      ctx.textAlign = 'right'
      ctx.fillStyle = '#333'
      ctx.font = 'bold 34px sans-serif'
      ctx.fillText(item.displayPassenger, canvasWidth - padding - 25, itemY + 58)
    })
    
    y += listHeight + padding + 20

    // 绘制底部水印区域
    // logo
    if (logoImg) {
      const footerLogoSize = 36
      ctx.globalAlpha = 0.6
      ctx.drawImage(logoImg, canvasWidth / 2 - 130, y + 12, footerLogoSize, footerLogoSize)
      ctx.globalAlpha = 1
    }
    
    ctx.textAlign = 'left'
    ctx.fillStyle = '#999'
    ctx.font = '24px sans-serif'
    ctx.fillText('蓉城客流', canvasWidth / 2 - 85, y + 38)
    
    ctx.textAlign = 'center'
    ctx.fillStyle = '#bbb'
    ctx.font = '22px sans-serif'
    ctx.fillText('数据来源：成都地铁', canvasWidth / 2, y + 75)

    // 导出并保存图片
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvas: canvas,
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        destWidth: canvasWidth * 2,
        destHeight: canvasHeight * 2,
        fileType: 'png',
        quality: 1,
        success: (tempRes) => {
          wx.saveImageToPhotosAlbum({
            filePath: tempRes.tempFilePath,
            success: () => {
              wx.hideLoading()
              this.setData({ generatingImage: false })
              wx.showToast({ title: '已保存到相册', icon: 'success' })
            },
            fail: (err) => {
              wx.hideLoading()
              this.setData({ generatingImage: false })
              console.log('保存失败:', err)
              wx.showModal({
                title: '保存失败',
                content: err.errMsg || '请重试',
                showCancel: false
              })
            }
          })
        },
        fail: (err) => {
          wx.hideLoading()
          this.setData({ generatingImage: false })
          console.log('生成图片失败:', err)
          wx.showToast({ title: '生成失败，请重试', icon: 'none' })
        }
      })
    }, 100)
  },

  // 绘制圆角矩形
  drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  },

  drawBarChart(options = {}) {
    const { canvasId = 'barChart', showValues = false, retryCount = 0 } = options
    const lineList = this.data.lineList
    if (!lineList || lineList.length === 0) {
      console.log('drawBarChart: lineList为空，无法绘制图表')
      return
    }

    // 最多重试5次
    if (retryCount > 5) {
      console.error('drawBarChart: 重试次数过多，放弃绘制')
      return
    }

    console.log('drawBarChart: 开始绘制图表，数据量:', lineList.length, '重试次数:', retryCount)
    
    const query = wx.createSelectorQuery().in(this)
    query.select('#' + canvasId)
      .fields({ node: true, size: true })
      .exec((res) => {
        console.log('drawBarChart: query结果', res)
        
        if (!res || !res[0]) {
          console.error('drawBarChart: 无法获取canvas元素，200ms后重试...')
          setTimeout(() => this.drawBarChart({ canvasId, showValues, retryCount: retryCount + 1 }), 200)
          return
        }
        
        const canvas = res[0].node
        if (!canvas) {
          console.error('drawBarChart: canvas节点为空，200ms后重试...')
          setTimeout(() => this.drawBarChart({ canvasId, showValues, retryCount: retryCount + 1 }), 200)
          return
        }
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.error('drawBarChart: 无法获取canvas上下文，200ms后重试...')
          setTimeout(() => this.drawBarChart({ canvasId, showValues, retryCount: retryCount + 1 }), 200)
          return
        }
        
        const sysInfo = wx.getSystemInfoSync()
        const dpr = sysInfo.pixelRatio
        // 计算逻辑尺寸（CSS像素）
        const width = (res[0].width && res[0].width > 0) ? res[0].width : (690 / 750 * sysInfo.windowWidth)
        const height = (res[0].height && res[0].height > 0) ? res[0].height : (350 / 750 * sysInfo.windowWidth)
        
        console.log('drawBarChart: canvas尺寸', width, height, 'dpr:', dpr)
        
        // 设置Canvas物理尺寸（像素）- 设置后会自动清空画布和重置变换
        canvas.width = Math.floor(width * dpr)
        canvas.height = Math.floor(height * dpr)
        
        // 缩放上下文，使绘制使用逻辑像素
        ctx.scale(dpr, dpr)
        
        console.log('drawBarChart: Canvas设置完成', {
          logicalWidth: width,
          logicalHeight: height,
          physicalWidth: canvas.width,
          physicalHeight: canvas.height,
          dpr
        })
        
        // 绘制背景（白色）
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        
        // 图表参数 - 优化边距和间距
        const padding = showValues
          ? { top: 30, right: 25, bottom: 60, left: 55 } // 放大模式减少留白
          : { top: 50, right: 25, bottom: 70, left: 55 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom
        
        const maxValue = Math.max(...lineList.map(item => parseFloat(item.passenger))) * 1.15
        const totalBars = lineList.length
        // 确保有足够的空间绘制
        if (totalBars === 0 || maxValue === 0) {
          console.warn('drawBarChart: 数据无效，无法绘制', { totalBars, maxValue, lineList })
          return
        }
        // 根据线路数量动态调整柱子宽度和间距
        let barWidthRatio, gapRatio
        if (totalBars <= 2) {
          // 只有1-2条线时，柱子更细，间距更大
          barWidthRatio = 0.3
          gapRatio = 0.7
        } else if (totalBars <= 5) {
          // 3-5条线时，中等宽度
          barWidthRatio = 0.45
          gapRatio = 0.55
        } else {
          // 多条线时，保持合适宽度，避免太细
          barWidthRatio = 0.5
          gapRatio = 0.5
        }
        const barWidth = chartWidth / totalBars * barWidthRatio
        const gap = chartWidth / totalBars * gapRatio
        
        // 绘制柱状图
        console.log('drawBarChart: 绘制参数', { 
          maxValue, 
          totalBars, 
          barWidth, 
          gap, 
          chartWidth, 
          chartHeight,
          padding 
        })
        
        // 绘制Y轴刻度和网格线
        ctx.fillStyle = '#666'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'right'
        for (let i = 0; i <= 4; i++) {
          const y = padding.top + chartHeight * (1 - i / 4)
          const value = (maxValue * i / 4).toFixed(0)
          ctx.fillText(value, padding.left - 12, y + 4)
          
          // 绘制网格线（更淡的颜色）
          ctx.strokeStyle = '#f5f5f5'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(padding.left, y)
          ctx.lineTo(width - padding.right, y)
          ctx.stroke()
        }
        
        // 绘制柱状图
        console.log('drawBarChart: 开始绘制', lineList.length, '个柱子')
        lineList.forEach((item, index) => {
          const x = padding.left + index * (barWidth + gap) + gap / 2
          const barHeight = (item.passenger / maxValue) * chartHeight
          const y = height - padding.bottom - barHeight
          
          // 确保颜色存在，如果没有则使用默认颜色
          const barColor = item.color || '#1296db'
          
          console.log(`drawBarChart: 绘制第${index + 1}个柱子`, {
            name: item.name,
            passenger: item.passenger,
            color: barColor,
            x, y, barWidth, barHeight
          })
          
          // 绘制柱子阴影
          ctx.save()
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
          ctx.shadowBlur = 6
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 3
          
          // 绘制柱子（圆角矩形，更美观）
          const radius = 6
          ctx.fillStyle = barColor
          ctx.beginPath()
          ctx.moveTo(x + radius, y)
          ctx.lineTo(x + barWidth - radius, y)
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
          ctx.lineTo(x + barWidth, y + barHeight)
          ctx.lineTo(x, y + barHeight)
          ctx.lineTo(x, y + radius)
          ctx.quadraticCurveTo(x, y, x + radius, y)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
          
          // 绘制X轴标签 - 只显示数字（增加间距）
          ctx.fillStyle = barColor
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          // 提取线路数字
          let label = item.name.replace('号线', '').replace('线', '')
          if (label === '蓉2') label = 'R2'
          ctx.fillText(label, x + barWidth / 2, height - padding.bottom + 20)

          // 放大模式下，在柱子上方显示客流数值（取整，避免重叠）
          if (showValues) {
            const valueText = Math.round(item.passenger || 0).toString()
            ctx.fillStyle = '#1a73e8'  // 蓝色，清晰可读
            ctx.font = '9px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            const valueY = y - 4
            ctx.fillText(valueText, x + barWidth / 2, valueY)
  }
        })
        
        console.log('drawBarChart: 图表绘制完成，共绘制', lineList.length, '个柱子')
        
        // 验证绘制结果 - 检查Canvas是否有内容
        try {
          const imageData = ctx.getImageData(width / 2, height / 2, 1, 1)
          console.log('drawBarChart: Canvas中间点颜色', imageData.data.slice(0, 4))
        } catch (e) {
          console.warn('drawBarChart: 无法获取Canvas内容', e)
  }
      })
  },

  // 绘制折线图
  drawLineChart(retryCount = 0) {
    const weekData = this.data.weekData
    if (!weekData || weekData.length === 0) {
      console.log('drawLineChart: weekData为空，无法绘制图表')
      return
    }

    // 最多重试5次
    if (retryCount > 5) {
      console.error('drawLineChart: 重试次数过多，放弃绘制')
      return
    }

    console.log('drawLineChart: 开始绘制图表，数据量:', weekData.length, '重试次数:', retryCount)

    const query = wx.createSelectorQuery().in(this)
    query.select('#lineChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        console.log('drawLineChart: query结果', res)
        
        if (!res || !res[0]) {
          console.error('drawLineChart: 无法获取canvas元素，200ms后重试...')
          setTimeout(() => this.drawLineChart(retryCount + 1), 200)
          return
        }
        
        const canvas = res[0].node
        if (!canvas) {
          console.error('drawLineChart: canvas节点为空，200ms后重试...')
          setTimeout(() => this.drawLineChart(retryCount + 1), 200)
          return
        }
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.error('drawLineChart: 无法获取canvas上下文，200ms后重试...')
          setTimeout(() => this.drawLineChart(retryCount + 1), 200)
          return
        }
        
        const windowInfo = wx.getWindowInfo()
        const deviceInfo = wx.getDeviceInfo()
        const dpr = deviceInfo.pixelRatio || windowInfo.pixelRatio || 1
        const width = (res[0].width && res[0].width > 0) ? res[0].width : (690 / 750 * windowInfo.windowWidth)
        const height = (res[0].height && res[0].height > 0) ? res[0].height : (400 / 750 * windowInfo.windowWidth)
        
        console.log('drawLineChart: canvas尺寸', width, height, 'dpr:', dpr)
        
        // 设置Canvas物理尺寸 - 设置后会自动清空画布和重置变换
        canvas.width = Math.floor(width * dpr)
        canvas.height = Math.floor(height * dpr)
        
        // 缩放上下文
        ctx.scale(dpr, dpr)
        
        // 绘制背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        
        // 图表参数
        const padding = { top: 40, right: 30, bottom: 50, left: 60 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom
        
        const values = weekData.map(item => item.totalPassenger)
        const maxValue = Math.max(...values) * 1.1
        const minValue = Math.min(...values) * 0.9
        const valueRange = maxValue - minValue
        
        // 绘制网格
        ctx.strokeStyle = '#f0f0f0'
        ctx.lineWidth = 1
        for (let i = 0; i <= 5; i++) {
          const y = padding.top + chartHeight * (1 - i / 5)
          ctx.beginPath()
          ctx.moveTo(padding.left, y)
          ctx.lineTo(width - padding.right, y)
          ctx.stroke()
          
          // Y轴刻度
          const value = (minValue + valueRange * i / 5).toFixed(0)
          ctx.fillStyle = '#666'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'right'
          ctx.fillText(value, padding.left - 5, y + 3)
        }
        
        // 计算点坐标
        const points = weekData.map((item, index) => {
          const x = padding.left + (index / (weekData.length - 1)) * chartWidth
          const y = padding.top + chartHeight * (1 - (item.totalPassenger - minValue) / valueRange)
          return { x, y, data: item }
        })
        
        // 绘制渐变区域
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
        gradient.addColorStop(0, 'rgba(18, 150, 219, 0.3)')
        gradient.addColorStop(1, 'rgba(18, 150, 219, 0.05)')
        
        ctx.beginPath()
        ctx.moveTo(points[0].x, height - padding.bottom)
        points.forEach(p => ctx.lineTo(p.x, p.y))
        ctx.lineTo(points[points.length - 1].x, height - padding.bottom)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()
        
        // 绘制折线
        ctx.beginPath()
        ctx.strokeStyle = '#1296db'
        ctx.lineWidth = 2
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        })
        ctx.stroke()
        
        // 绘制数据点和标签
        points.forEach((p, index) => {
          // 数据点
          ctx.beginPath()
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
          ctx.fillStyle = '#1296db'
          ctx.fill()
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // 数值标签
          ctx.fillStyle = '#333'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(p.data.totalPassenger.toFixed(2), p.x, p.y - 12)
          
          // X轴日期标签
          ctx.fillStyle = '#666'
          ctx.font = '10px sans-serif'
          ctx.fillText(p.data.shortDate, p.x, height - padding.bottom + 15)
          ctx.fillText(p.data.weekday, p.x, height - padding.bottom + 28)
        })
        
        // 绘制标题
        ctx.fillStyle = '#333'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('近7日客流趋势（万人次）', width / 2, 25)
        
        console.log('drawLineChart: 图表绘制完成')
      })
  },

  // 绘制月日均折线图（只显示纯地铁）
  drawMonthDailyLineChart(retryCount = 0) {
    const monthDailyData = this.data.dailyAverageData.monthDailyData
    if (!monthDailyData || monthDailyData.length === 0) {
      console.log('drawMonthDailyLineChart: monthDailyData为空，无法绘制图表')
      return
    }

    // 最多重试5次
    if (retryCount > 5) {
      console.error('drawMonthDailyLineChart: 重试次数过多，放弃绘制')
      return
    }

    console.log('drawMonthDailyLineChart: 开始绘制图表，数据量:', monthDailyData.length, '重试次数:', retryCount)

    const query = wx.createSelectorQuery().in(this)
    query.select('#monthDailyLineChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        console.log('drawMonthDailyLineChart: query结果', res)
        
        if (!res || !res[0]) {
          console.error('drawMonthDailyLineChart: 无法获取canvas元素，200ms后重试...')
          setTimeout(() => this.drawMonthDailyLineChart(retryCount + 1), 200)
          return
        }
        
        const canvas = res[0].node
        if (!canvas) {
          console.error('drawMonthDailyLineChart: canvas节点为空，200ms后重试...')
          setTimeout(() => this.drawMonthDailyLineChart(retryCount + 1), 200)
          return
        }
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.error('drawMonthDailyLineChart: 无法获取canvas上下文，200ms后重试...')
          setTimeout(() => this.drawMonthDailyLineChart(retryCount + 1), 200)
          return
        }
        
        const windowInfo = wx.getWindowInfo()
        const deviceInfo = wx.getDeviceInfo()
        const dpr = deviceInfo.pixelRatio || windowInfo.pixelRatio || 1
        const width = (res[0].width && res[0].width > 0) ? res[0].width : (690 / 750 * windowInfo.windowWidth)
        const height = (res[0].height && res[0].height > 0) ? res[0].height : (450 / 750 * windowInfo.windowWidth)
        
        console.log('drawMonthDailyLineChart: canvas尺寸', width, height, 'dpr:', dpr)
        
        // 设置Canvas物理尺寸
        canvas.width = Math.floor(width * dpr)
        canvas.height = Math.floor(height * dpr)
        ctx.scale(dpr, dpr)
        
        // 绘制背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        
        // 图表参数
        const padding = { top: 40, right: 30, bottom: 60, left: 60 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom
        
        // 计算数值范围（只使用纯地铁数据）
        const pureValues = monthDailyData.map(item => item.pure)
        const maxValue = Math.max(...pureValues) * 1.1
        const minValue = Math.min(...pureValues) * 0.9
        const valueRange = maxValue - minValue
        
        // 绘制网格和Y轴刻度
        ctx.strokeStyle = '#f0f0f0'
        ctx.lineWidth = 1
        ctx.fillStyle = '#666'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'right'
        
        for (let i = 0; i <= 5; i++) {
          const y = padding.top + chartHeight * (1 - i / 5)
          ctx.beginPath()
          ctx.moveTo(padding.left, y)
          ctx.lineTo(width - padding.right, y)
          ctx.stroke()
          
          // Y轴刻度
          const value = (minValue + valueRange * i / 5).toFixed(0)
          ctx.fillText(value, padding.left - 8, y + 4)
        }
        
        // 计算纯地铁点坐标
        const purePoints = monthDailyData.map((item, index) => {
          const x = padding.left + (index / (monthDailyData.length - 1 || 1)) * chartWidth
          const y = padding.top + chartHeight * (1 - (item.pure - minValue) / valueRange)
          return { x, y, data: item }
        })
        
        // 绘制纯地铁渐变区域
        const pureGradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
        pureGradient.addColorStop(0, 'rgba(74, 166, 102, 0.3)')
        pureGradient.addColorStop(1, 'rgba(74, 166, 102, 0.05)')
        
        ctx.beginPath()
        ctx.moveTo(purePoints[0].x, height - padding.bottom)
        purePoints.forEach(p => ctx.lineTo(p.x, p.y))
        ctx.lineTo(purePoints[purePoints.length - 1].x, height - padding.bottom)
        ctx.closePath()
        ctx.fillStyle = pureGradient
        ctx.fill()
        
        // 绘制纯地铁折线（绿色）
        ctx.beginPath()
        ctx.strokeStyle = '#4EA666'
        ctx.lineWidth = 2.5
        purePoints.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        })
        ctx.stroke()
        
        // 绘制数据点和标签
        purePoints.forEach((p, index) => {
          // 纯地铁数据点（绿色）
          ctx.beginPath()
          ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2)
          ctx.fillStyle = '#4EA666'
          ctx.fill()
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // 在数据点上方显示数值
          ctx.fillStyle = '#333'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          const valueText = p.data.pure.toFixed(0)
          ctx.fillText(valueText, p.x, p.y - 8)
          
          // X轴日期标签（只显示部分日期，避免重叠）
          if (monthDailyData.length <= 15 || index % Math.ceil(monthDailyData.length / 10) === 0 || index === monthDailyData.length - 1) {
            ctx.fillStyle = '#666'
            ctx.font = '10px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText(p.data.day.toString(), p.x, height - padding.bottom + 15)
          }
        })
        
        console.log('drawMonthDailyLineChart: 图表绘制完成')
      })
  },

  // 绘制7日柱状图
  drawWeekBarChart(retryCount = 0) {
    const weekData = this.data.weekData
    if (!weekData || weekData.length === 0) {
      console.log('drawWeekBarChart: weekData为空，无法绘制图表')
      return
    }

    // 最多重试5次
    if (retryCount > 5) {
      console.error('drawWeekBarChart: 重试次数过多，放弃绘制')
      return
    }

    console.log('drawWeekBarChart: 开始绘制图表，数据量:', weekData.length, '重试次数:', retryCount)

    const query = wx.createSelectorQuery().in(this)
    query.select('#weekBarChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        console.log('drawWeekBarChart: query结果', res)
        
        if (!res || !res[0]) {
          console.error('drawWeekBarChart: 无法获取canvas元素，200ms后重试...')
          setTimeout(() => this.drawWeekBarChart(retryCount + 1), 200)
          return
        }
        
        const canvas = res[0].node
        if (!canvas) {
          console.error('drawWeekBarChart: canvas节点为空，200ms后重试...')
          setTimeout(() => this.drawWeekBarChart(retryCount + 1), 200)
          return
        }
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.error('drawWeekBarChart: 无法获取canvas上下文，200ms后重试...')
          setTimeout(() => this.drawWeekBarChart(retryCount + 1), 200)
          return
        }
        
        const windowInfo = wx.getWindowInfo()
        const deviceInfo = wx.getDeviceInfo()
        const dpr = deviceInfo.pixelRatio || windowInfo.pixelRatio || 1
        const width = (res[0].width && res[0].width > 0) ? res[0].width : (690 / 750 * windowInfo.windowWidth)
        const height = (res[0].height && res[0].height > 0) ? res[0].height : (350 / 750 * windowInfo.windowWidth)
        
        console.log('drawWeekBarChart: canvas尺寸', width, height, 'dpr:', dpr)
        
        // 设置Canvas物理尺寸
        canvas.width = Math.floor(width * dpr)
        canvas.height = Math.floor(height * dpr)
        
        // 缩放上下文
        ctx.scale(dpr, dpr)
        
        // 绘制纯白背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        
        // 图表参数 - 优化边距
        const padding = { top: 45, right: 25, bottom: 55, left: 55 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom
        
        const values = weekData.map(item => item.totalPassenger)
        const maxValue = Math.max(...values)
        const minValue = Math.min(...values)
        
        // 优化：Y轴不从0开始，让柱子差异更明显
        // 计算Y轴起始值（取最小值的90%，向下取整到50的倍数）
        const yAxisMin = Math.floor(minValue * 0.85 / 50) * 50
        // 计算Y轴最大值（取最大值的105%，向上取整到50的倍数）
        const yAxisMax = Math.ceil(maxValue * 1.05 / 50) * 50
        const yAxisRange = yAxisMax - yAxisMin
        const yAxisStep = yAxisRange / 5
        
        // 定义7种渐变色（更现代的配色）
        const colors = [
          { start: '#667eea', end: '#5a67d8' },  // 紫蓝
          { start: '#3182ce', end: '#2b6cb0' },  // 蓝色
          { start: '#d53f8c', end: '#b83280' },  // 玫红
          { start: '#38a169', end: '#2f855a' },  // 绿色
          { start: '#805ad5', end: '#6b46c1' },  // 紫色
          { start: '#dd6b20', end: '#c05621' },  // 橙色
          { start: '#319795', end: '#2c7a7b' }   // 青色
        ]
        
        // 绘制Y轴刻度和网格线（虚线效果）
        ctx.fillStyle = '#64748b'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        
        for (let i = 0; i <= 5; i++) {
          const y = padding.top + chartHeight * (1 - i / 5)
          const value = Math.round(yAxisMin + yAxisStep * i)
          
          // 绘制虚线网格
          ctx.strokeStyle = '#e2e8f0'
          ctx.lineWidth = 1
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(padding.left, y)
          ctx.lineTo(width - padding.right, y)
          ctx.stroke()
          ctx.setLineDash([])
          
          // 绘制Y轴刻度值
          ctx.fillText(value.toString(), padding.left - 10, y)
        }
        
        // 绘制柱状图
        const barWidth = chartWidth / weekData.length * 0.55
        const barSpacing = chartWidth / weekData.length
        
        weekData.forEach((item, index) => {
          const x = padding.left + index * barSpacing + (barSpacing - barWidth) / 2
          // 使用优化后的Y轴范围计算柱子高度
          const barHeight = ((item.totalPassenger - yAxisMin) / yAxisRange) * chartHeight
          const y = height - padding.bottom - barHeight
          const colorSet = colors[index % colors.length]
          
          // 绘制柱子阴影
          ctx.save()
          ctx.shadowColor = 'rgba(0, 0, 0, 0.12)'
          ctx.shadowBlur = 8
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 4
          
          // 绘制圆角柱子（渐变填充）
          const barGradient = ctx.createLinearGradient(x, y, x, y + barHeight)
          barGradient.addColorStop(0, colorSet.start)
          barGradient.addColorStop(1, colorSet.end)
          ctx.fillStyle = barGradient
          
          // 圆角矩形
          const radius = 6
          ctx.beginPath()
          ctx.moveTo(x + radius, y)
          ctx.lineTo(x + barWidth - radius, y)
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
          ctx.lineTo(x + barWidth, y + barHeight)
          ctx.lineTo(x, y + barHeight)
          ctx.lineTo(x, y + radius)
          ctx.quadraticCurveTo(x, y, x + radius, y)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
          
          // 绘制数值标签（带背景的标签，更醒目）
          const valueText = item.totalPassenger.toFixed(2)
          ctx.font = 'bold 11px sans-serif'
          const textWidth = ctx.measureText(valueText).width
          
          // 绘制标签背景（圆角矩形）
          ctx.fillStyle = colorSet.start
          const labelPadding = 4
          const labelWidth = textWidth + labelPadding * 2
          const labelHeight = 18
          const labelX = x + barWidth / 2 - labelWidth / 2
          const labelY = y - labelHeight - 6
          
          ctx.beginPath()
          ctx.moveTo(labelX + 4, labelY)
          ctx.lineTo(labelX + labelWidth - 4, labelY)
          ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + 4)
          ctx.lineTo(labelX + labelWidth, labelY + labelHeight - 4)
          ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - 4, labelY + labelHeight)
          ctx.lineTo(labelX + 4, labelY + labelHeight)
          ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - 4)
          ctx.lineTo(labelX, labelY + 4)
          ctx.quadraticCurveTo(labelX, labelY, labelX + 4, labelY)
          ctx.closePath()
          ctx.fill()
          
          // 绘制数值文本
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(valueText, x + barWidth / 2, labelY + labelHeight / 2)
          
          // 绘制日期标签
          ctx.fillStyle = '#475569'
          ctx.font = '11px sans-serif'
          ctx.textBaseline = 'top'
          const dateStr = item.shortDate || item.date.slice(5)
          ctx.fillText(dateStr, x + barWidth / 2, height - padding.bottom + 10)
        })
        
        console.log('drawWeekBarChart: 图表绘制完成')
      })
  },

  // 查询最新数据（昨天，因为第二天才更新前一天的数据）
  queryLatest() {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = this.formatDate(yesterday)
    this.setData({ selectedDate: dateStr, weekData: [] })
    this.queryPassengerData(dateStr)
  },

  // 查询前一天
  queryPreviousDay() {
    const currentDate = new Date(this.data.selectedDate)
    currentDate.setDate(currentDate.getDate() - 1)
    const dateStr = this.formatDate(currentDate)
    
    // 检查日期是否在有效范围内
    const minDate = new Date('2010-09-27')
    if (currentDate < minDate) {
      wx.showToast({ title: '已到最早日期', icon: 'none' })
      return
    }
    
    this.setData({ selectedDate: dateStr, weekData: [] })
    this.queryPassengerData(dateStr)
  },

  // 查询后一天
  queryNextDay() {
    const currentDate = new Date(this.data.selectedDate)
    currentDate.setDate(currentDate.getDate() + 1)
    const dateStr = this.formatDate(currentDate)
    
    // 检查日期是否超过今天
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (currentDate >= today) {
      wx.showToast({ title: '已到最新日期', icon: 'none' })
      return
    }
    
    this.setData({ selectedDate: dateStr, weekData: [] })
    this.queryPassengerData(dateStr)
  },

  // 保存图片到相册
  saveChart(e) {
    const chartType = e.currentTarget.dataset.chart
    
    let canvasId = '#barChart'
    if (chartType === 'line') {
      canvasId = '#lineChart'
    } else if (chartType === 'bar-full') {
      canvasId = '#barChartFull'
    }
    
    // 先检查隐私协议授权（正式版需要）
    if (wx.getPrivacySetting) {
      wx.getPrivacySetting({
        success: (privacyRes) => {
          console.log('隐私协议状态:', privacyRes)
          if (privacyRes.needAuthorization) {
            // 需要用户同意隐私协议
            wx.requirePrivacyAuthorize({
              success: () => {
                // 用户同意了隐私协议，继续检查相册权限
                this.checkAlbumPermission(canvasId)
              },
              fail: () => {
                wx.showToast({ title: '需要同意隐私协议', icon: 'none' })
              }
            })
          } else {
            // 已同意隐私协议，检查相册权限
            this.checkAlbumPermission(canvasId)
          }
        },
        fail: () => {
          // 获取隐私设置失败，直接尝试保存
          this.checkAlbumPermission(canvasId)
        }
      })
    } else {
      // 低版本不支持隐私API，直接检查相册权限
      this.checkAlbumPermission(canvasId)
    }
  },

  // 检查相册权限
  checkAlbumPermission(canvasId) {
    wx.getSetting({
      success: (settingRes) => {
        console.log('权限状态:', settingRes.authSetting)
        const hasAuth = settingRes.authSetting['scope.writePhotosAlbum']
        
        if (hasAuth === true) {
          // 已有权限，直接保存
          this.doSaveChart(canvasId)
        } else if (hasAuth === false) {
          // 用户之前拒绝过授权，引导去设置页面开启
          wx.showModal({
            title: '需要相册权限',
            content: '保存图片需要您授权访问相册，请在设置中开启',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting({
                  success: (openSettingRes) => {
                    if (openSettingRes.authSetting['scope.writePhotosAlbum']) {
                      this.doSaveChart(canvasId)
                    }
                  }
                })
              }
            }
          })
        } else {
          // 首次请求，使用 wx.authorize 主动请求权限
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              console.log('授权成功')
              this.doSaveChart(canvasId)
            },
            fail: (err) => {
              console.log('授权失败:', err)
              // 用户拒绝了授权，引导去设置
              wx.showModal({
                title: '需要相册权限',
                content: '保存图片需要您授权访问相册',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting({
                      success: (openSettingRes) => {
                        if (openSettingRes.authSetting['scope.writePhotosAlbum']) {
                          this.doSaveChart(canvasId)
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        }
      },
      fail: (err) => {
        console.log('获取设置失败:', err)
        wx.showToast({ title: '获取权限失败', icon: 'none' })
      }
    })
  },

  // 执行保存图片操作
  doSaveChart(canvasId) {
    wx.showLoading({ title: '正在保存...', mask: true })
    
    wx.createSelectorQuery()
      .select(canvasId)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) {
          wx.hideLoading()
          wx.showToast({ title: '图表未加载完成', icon: 'none' })
          return
        }
        
        const canvas = res[0].node
        const width = res[0].width
        const height = res[0].height
        
        wx.canvasToTempFilePath({
          canvas: canvas,
          x: 0,
          y: 0,
          width: width,
          height: height,
          destWidth: width * 2,
          destHeight: height * 2,
          fileType: 'png',
          quality: 1,
          success: (tempRes) => {
            console.log('临时文件路径:', tempRes.tempFilePath)
            wx.saveImageToPhotosAlbum({
              filePath: tempRes.tempFilePath,
              success: () => {
                wx.hideLoading()
                wx.showToast({ title: '已保存到相册', icon: 'success' })
              },
              fail: (err) => {
                wx.hideLoading()
                console.log('保存到相册失败:', JSON.stringify(err))
                // 检查是否是用户拒绝授权（兼容多种错误信息格式）
                const errMsg = (err.errMsg || '').toLowerCase()
                const isAuthDeny = errMsg.includes('auth deny') || 
                                   errMsg.includes('authorize') || 
                                   errMsg.includes('deny') ||
                                   errMsg.includes('cancel') ||
                                   errMsg.includes('privacy') ||
                                   err.errno === 103
                
                if (isAuthDeny) {
                  wx.showModal({
                    title: '需要相册权限',
                    content: '保存图片需要您授权访问相册，请在设置中开启',
                    confirmText: '去设置',
                    cancelText: '取消',
                    success: (modalRes) => {
                      if (modalRes.confirm) {
                        wx.openSetting({
                          success: (openSettingRes) => {
                            if (openSettingRes.authSetting['scope.writePhotosAlbum']) {
                              this.doSaveChart(canvasId)
                            }
                          }
                        })
                      }
                    }
                  })
                } else {
                  // 显示详细错误信息便于排查
                  wx.showModal({
                    title: '保存失败',
                    content: err.errMsg || '未知错误，请重试',
                    showCancel: false
                  })
                }
              }
            })
          },
          fail: (err) => {
            wx.hideLoading()
            console.log('图片生成失败:', JSON.stringify(err))
            wx.showModal({
              title: '图片生成失败',
              content: err.errMsg || '请重试',
              showCancel: false
            })
          }
        })
      })
  },

  // 保存包含标题的完整柱状图
  saveFullChartWithTitle() {
    const safeRoundRect = (ctx, x, y, w, h, r) => {
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r)
        return
      }
      const radius = Math.min(r, w / 2, h / 2)
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + w - radius, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
      ctx.lineTo(x + w, y + h - radius)
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
      ctx.lineTo(x + radius, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
    }

    wx.showLoading({ title: '生成中...', mask: true })

    try {
      const query = wx.createSelectorQuery().in(this)
      query.select('#saveCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0] || !res[0].node) {
            wx.hideLoading()
            wx.showToast({ title: '保存失败', icon: 'none' })
            return
          }

          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = (wx.getWindowInfo && wx.getWindowInfo().pixelRatio) || wx.getSystemInfoSync().pixelRatio || 2
          
          // 设置画布尺寸（更小更快，只保留必要信息）
          const width = 300
          const height = 420
          canvas.width = width * dpr
          canvas.height = height * dpr
          ctx.scale(dpr, dpr)

          // 清空画布
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, width, height)

          // 头部：单位 / 总客流 / 日期（极简）
          const headerHeight = 90
          ctx.fillStyle = '#f7f8fb'
          ctx.beginPath()
          safeRoundRect(ctx, 10, 10, width - 20, headerHeight, 12)
          ctx.fill()

          const totalValue = this.data.passengerData.totalPassengerDisplay || this.data.passengerData.metroOnlyPassengerDisplay || '0'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#666'
          ctx.font = '12px sans-serif'
          ctx.fillText('单位：万人次', width / 2, 30)

          ctx.fillStyle = '#111'
          ctx.font = 'bold 40px \"DIN Alternate\", \"Helvetica Neue\", sans-serif'
          ctx.fillText(totalValue, width / 2, 60)

          ctx.fillStyle = '#777'
          ctx.font = '12px sans-serif'
          ctx.fillText(this.data.selectedDate, width / 2, 82)

          // 分隔标题
          ctx.fillStyle = '#333333'
          ctx.font = 'bold 16px sans-serif'
          ctx.textAlign = 'left'
          ctx.fillText('各线路客流量', 15, headerHeight + 35)
          
          ctx.fillStyle = '#999999'
          ctx.font = '12px sans-serif'
          ctx.fillText('（' + this.data.selectedDate + '）', 115, headerHeight + 35)

          // 绘制柱状图（含数值标注）
          this.drawBarChartOnCanvas(ctx, 10, headerHeight + 50, width - 20, height - headerHeight - 60)

          // 保存图片
          wx.canvasToTempFilePath({
            canvas: canvas,
            success: (res) => {
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: () => {
                  wx.hideLoading()
                  wx.showToast({ title: '已保存到相册', icon: 'success' })
                },
                fail: (err) => {
                  wx.hideLoading()
                  if (err.errMsg && err.errMsg.includes('auth')) {
                    wx.showModal({
                      title: '需要授权',
                      content: '请允许保存到相册以便导出图片',
                      confirmText: '去设置',
                      success: (res) => {
                        if (res.confirm) {
                          wx.openSetting({})
    }
  }
                    })
                  } else {
                    wx.showToast({ title: '保存失败', icon: 'none' })
    }
  }
              })
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({ title: '生成图片失败', icon: 'none' })
  }
          })
        })
    } catch (err) {
      console.error('saveFullChartWithTitle error:', err)
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
  }
  },

  // 在指定canvas上绘制柱状图
  drawBarChartOnCanvas(ctx, x, y, width, height) {
    const lineList = this.data.lineList
    if (!lineList || lineList.length === 0) return

    const padding = { top: 25, bottom: 35, left: 25, right: 15 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    
    const totalBars = lineList.length
    let barWidthRatio = 0.5
    let gapRatio = 0.5
    if (totalBars <= 2) {
      barWidthRatio = 0.3
      gapRatio = 0.7
    } else if (totalBars <= 5) {
      barWidthRatio = 0.45
      gapRatio = 0.55
    }

    const barWidth = (chartWidth / totalBars) * barWidthRatio
    const gap = (chartWidth / totalBars) * gapRatio

    const maxValue = Math.max(...lineList.map(item => item.passenger))
    const yAxisMax = Math.ceil(maxValue / 10) * 10

    // 绘制Y轴刻度
    ctx.fillStyle = '#999'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const ySteps = 4
    for (let i = 0; i <= ySteps; i++) {
      const yValue = (yAxisMax / ySteps) * i
      const yPos = y + padding.top + chartHeight - (chartHeight * i / ySteps)
      ctx.fillText(Math.round(yValue).toString(), x + padding.left - 5, yPos)
      
      ctx.strokeStyle = '#eee'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(x + padding.left, yPos)
      ctx.lineTo(x + width - padding.right, yPos)
      ctx.stroke()
    }

    // 绘制柱子
    lineList.forEach((item, index) => {
      const barX = x + padding.left + index * (barWidth + gap) + gap / 2
      const barHeight = (item.passenger / yAxisMax) * chartHeight
      const barY = y + padding.top + chartHeight - barHeight

      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.roundRect(barX, barY, barWidth, barHeight, 3)
      ctx.fill()

      // 绘制数值
      ctx.fillStyle = '#333'
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(item.passenger.toString(), barX + barWidth / 2, barY - 2)

      // 绘制X轴标签
      ctx.fillStyle = item.color
      ctx.font = 'bold 9px sans-serif'
      ctx.textBaseline = 'top'
      const label = item.name.replace('号线', '').replace('蓉', 'R')
      ctx.fillText(label, barX + barWidth / 2, y + padding.top + chartHeight + 5)
    })
  }
})