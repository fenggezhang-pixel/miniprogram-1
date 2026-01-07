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
    showVersionTip: false
  },

  onLoad(options) {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const todayStr = this.formatDate(today)
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
      currentDate: todayStr,
      selectedDate: targetDate
    })
    this.queryPassengerData(targetDate)
    
    // 检查是否需要显示版本更新提示
    this.checkVersionTip()
  },
  
  // 检查并显示版本更新提示
  checkVersionTip() {
    const versionKey = 'version_tip_2.1.7_shown'
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

  onReady() {
    // 获取设备信息用于canvas适配
    const deviceInfo = wx.getDeviceInfo()
    const windowInfo = wx.getWindowInfo()
    this.pixelRatio = deviceInfo.pixelRatio || windowInfo.pixelRatio || 1
    this.screenWidth = windowInfo.windowWidth
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
    this.setData({ activeTab: tab })
    
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
          return {
            rank: index + 1,
            date: normalized.date || record.date || '',
            weekday: normalized.weekday || record.weekday || '',
            dayType: normalized.dayType || record.dayType || '',
            lunarDate: normalized.lunarDate || record.lunarDate || '',
            weather: normalized.weather || record.weather || '',
            maxTemp: normalized.maxTemp || record.maxTemp || null,
            minTemp: normalized.minTemp || record.minTemp || null,
            restrictedPlate: normalized.restrictedPlate || record.restrictedPlate || '',
            totalPassenger: this.getTotalPassenger(record).toFixed(2)
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
          // 使用 pureMetroPassenger 字段作为客流数值（兼容两种字段名格式）
          const pureMetroPassenger = record['pureMetroPassenger(number)'] || record.pureMetroPassenger || normalized.pureMetroPassenger || this.getMetroOnlyPassenger(record)
          return {
            rank: index + 1,
            date: normalized.date || record.date || '',
            weekday: normalized.weekday || record.weekday || '',
            dayType: normalized.dayType || record.dayType || '',
            lunarDate: normalized.lunarDate || record.lunarDate || '',
            weather: normalized.weather || record.weather || '',
            maxTemp: normalized.maxTemp || record.maxTemp || null,
            minTemp: normalized.minTemp || record.minTemp || null,
            restrictedPlate: normalized.restrictedPlate || record.restrictedPlate || '',
            totalPassenger: parseFloat(pureMetroPassenger).toFixed(2)
          }
        })
        this.setData({ top10List, top10Loading: false })
      } else {
        this.setData({ top10List: [], top10Loading: false })
      }
    } catch (err) {
      console.error('纯地铁客流聚合查询失败:', err)
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
        
        // 绘制背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        
        // 准备数据 - 使用成都地铁官方线路颜色
        const barData = []
        const colors = {
          current: '#061098',     // 1号线蓝色 - 当天
          custom: '#4EA666'       // 4号线绿色 - 自定义日期
        }
        
        if (compareData.current) {
          barData.push({ 
            label: '当天', 
            value: compareData.current.totalPassenger, 
            color: colors.current,
            date: compareData.current.dateShort || compareData.current.date.slice(5)
          })
        }
        if (compareData.custom) {
          barData.push({ 
            label: '对比', 
            value: compareData.custom.totalPassenger, 
            color: colors.custom,
            date: compareData.custom.dateShort || compareData.custom.date.slice(5)
          })
        }
        
        if (barData.length === 0) return
        
        // 图表参数 - 优化布局，使两个柱子居中且间距更大
        const padding = { top: 60, right: 60, bottom: 100, left: 70 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom
        
        const maxValue = Math.max(...barData.map(item => item.value)) * 1.2
        const totalBars = barData.length
        
        // 计算柱子宽度和间距，让两个柱子居中显示，间距更大
        const availableWidth = chartWidth
        const barWidth = availableWidth * 0.35  // 柱子宽度占可用宽度的35%
        const totalGap = availableWidth - (barWidth * totalBars)  // 总间距
        const gap = totalGap / (totalBars + 1)  // 柱子之间的间距，两端也有间距
        
        // 绘制Y轴刻度和网格线
        ctx.fillStyle = '#666'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'right'
        for (let i = 0; i <= 4; i++) {
          const y = padding.top + chartHeight * (1 - i / 4)
          const value = (maxValue * i / 4).toFixed(0)
          ctx.fillText(value, padding.left - 15, y + 4)
          
          // 绘制网格线（更淡的颜色）
          ctx.strokeStyle = '#f5f5f5'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(padding.left, y)
          ctx.lineTo(width - padding.right, y)
          ctx.stroke()
        }
        
        // 绘制柱状图
        barData.forEach((item, index) => {
          // 计算柱子位置，居中显示
          const x = padding.left + gap + index * (barWidth + gap)
          const barHeight = (item.value / maxValue) * chartHeight
          const y = height - padding.bottom - barHeight
          
          // 绘制柱子阴影
          ctx.save()
          ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
          ctx.shadowBlur = 8
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 2
          
          // 绘制柱子（更大的圆角，更美观）
          const radius = 8
          ctx.fillStyle = item.color
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
          
          // 绘制数值标签（在柱子顶部，更大更清晰）
          ctx.fillStyle = '#333'
          ctx.font = 'bold 14px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(item.value.toFixed(2), x + barWidth / 2, y - 15)
          
          // 绘制X轴标签（更大字体）
          ctx.fillStyle = item.color
          ctx.font = 'bold 13px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(item.label, x + barWidth / 2, height - padding.bottom + 30)
          
          // 绘制日期（增加间距）
          ctx.fillStyle = '#666'
          ctx.font = '11px sans-serif'
          ctx.textAlign = 'center'
          const dateStr = item.date.length > 5 ? item.date.slice(5) : item.date
          ctx.fillText(dateStr, x + barWidth / 2, height - padding.bottom + 55)
        })
        
        // 绘制标题（更大更醒目）
        ctx.fillStyle = '#333'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('客流量同期对比（万人次）', width / 2, 30)
        
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
        
        // 绘制渐变背景
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
        bgGradient.addColorStop(0, '#E6F4FF')
        bgGradient.addColorStop(1, '#F0F9F5')
        ctx.fillStyle = bgGradient
        ctx.fillRect(0, 0, width, height)
        
        // 图表参数
        const padding = { top: 50, right: 20, bottom: 60, left: 50 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom
        
        const values = weekData.map(item => item.totalPassenger)
        const maxValue = Math.max(...values)
        const minValue = 0
        // 计算合适的Y轴最大值（向上取整到合适的整数）
        const yAxisMax = Math.ceil(maxValue * 1.1 / 200) * 200
        const yAxisStep = yAxisMax / 5
        
        // 定义7种颜色（使用成都地铁线路颜色）
        const colors = [
          '#061098', // 1号线 - 深蓝
          '#DA6648', // 2号线 - 橙红
          '#D1197D', // 3号线 - 紫红
          '#4EA666', // 4号线 - 绿色
          '#904690', // 5号线 - 紫色
          '#A36B34', // 6号线 - 棕色
          '#7CC2D5'  // 7号线 - 浅蓝
        ]
        
        // 绘制Y轴刻度和网格线
        ctx.strokeStyle = '#e0e0e0'
        ctx.lineWidth = 1
        ctx.fillStyle = '#666'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        
        for (let i = 0; i <= 5; i++) {
          const y = padding.top + chartHeight * (1 - i / 5)
          const value = (yAxisStep * i).toFixed(0)
          
          // 绘制网格线
          ctx.beginPath()
          ctx.moveTo(padding.left, y)
          ctx.lineTo(width - padding.right, y)
          ctx.stroke()
          
          // 绘制Y轴刻度
          ctx.fillText(value, padding.left - 8, y)
        }
        
        // 绘制柱状图
        const barWidth = chartWidth / weekData.length * 0.6
        const gap = chartWidth / weekData.length * 0.4
        const barSpacing = chartWidth / weekData.length
        
        weekData.forEach((item, index) => {
          const x = padding.left + index * barSpacing + gap / 2
          const barHeight = (item.totalPassenger / yAxisMax) * chartHeight
          const y = height - padding.bottom - barHeight
          const color = colors[index % colors.length]
          
          // 绘制柱子
          ctx.fillStyle = color
          ctx.fillRect(x, y, barWidth, barHeight)
          
          // 绘制数值标签（在柱子顶部）
          ctx.fillStyle = '#333'
          ctx.font = 'bold 11px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(item.totalPassenger.toFixed(2), x + barWidth / 2, y - 5)
          
          // 绘制日期标签
          ctx.fillStyle = '#666'
          ctx.font = '10px sans-serif'
          ctx.textBaseline = 'top'
          // 格式化日期：月-日
          const dateStr = item.shortDate || item.date.slice(5)
          ctx.fillText(dateStr, x + barWidth / 2, height - padding.bottom + 8)
        })
        
        // 绘制标题（已在WXML中显示，这里不绘制）
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
    
    wx.createSelectorQuery()
      .select(canvasId)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return
        
        const canvas = res[0].node
        wx.canvasToTempFilePath({
          canvas: canvas,
          success: (res) => {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                wx.showToast({ title: '已保存到相册', icon: 'success' })
              },
              fail: () => {
                wx.showToast({ title: '保存失败', icon: 'none' })
  }
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