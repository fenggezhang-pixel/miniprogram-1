const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    console.log('开始执行微博数据获取任务', new Date().toISOString())
    
    // 获取微博数据
    // 如果通过event传入文本（用于测试或手动触发），优先使用
    let weiboText = event.text || event.data?.text || null
    
    if (!weiboText) {
      // 尝试自动获取微博数据
      weiboText = await fetchWeiboData()
    }
    
    if (!weiboText) {
      console.error('未能获取微博数据')
      return {
        success: false,
        error: '未能获取微博数据，请检查微博获取函数或通过event传入文本'
      }
    }
    
    console.log('获取到微博文本:', weiboText)
    
    // 解析数据
    const parsedData = parseWeiboText(weiboText)
    if (!parsedData) {
      console.error('数据解析失败，文本内容:', weiboText)
      return {
        success: false,
        error: '数据解析失败，请检查文本格式'
      }
    }
    
    console.log('解析后的数据:', parsedData)
    
    // 验证数据
    if (!validateParsedData(parsedData)) {
      console.error('数据验证失败:', parsedData)
      return {
        success: false,
        error: '数据验证失败，数据格式不正确'
      }
    }
    
    // 计算客流数据
    const passengerData = calculatePassengerData(parsedData)
    console.log('计算后的客流数据:', passengerData)
    
    // 写入数据库
    const result = await saveToDatabase(passengerData)
    console.log('数据库操作结果:', result)
    
    return {
      success: true,
      data: passengerData,
      result: result,
      message: '数据已成功写入数据库'
    }
  } catch (error) {
    console.error('执行失败:', error)
    return {
      success: false,
      error: error.message || '未知错误',
      stack: error.stack
    }
  }
}

// 获取微博数据
async function fetchWeiboData() {
  try {
    // 注意：由于微博没有官方API，这里需要根据实际情况实现
    // 可选方案：
    // 1. 使用微博开放平台API（需要申请权限）
    // 2. 使用第三方微博数据服务
    // 3. 使用HTTP请求模拟（可能违反微博服务条款）
    // 4. 手动输入数据（通过云函数调用时传入event.data.text）
    
    // 如果通过云函数调用传入数据，直接返回
    // 可以从event中获取文本：const text = event.text || event.data?.text
    
    // 这里提供一个示例：可以通过HTTP请求获取（需要根据实际情况实现）
    // const result = await cloud.callFunction({
    //   name: 'weiboProxy',
    //   data: { userId: '成都地铁运营的用户ID' }
    // })
    // return result.result
    
    console.warn('微博数据获取功能需要根据实际情况实现')
    return null
  } catch (error) {
    console.error('获取微博数据失败:', error)
    throw error
  }
}

// 解析微博文本
function parseWeiboText(text) {
  try {
    if (!text || typeof text !== 'string') {
      console.error('文本为空或格式不正确')
      return null
    }
    
    // 正则表达式匹配日期（如：1月10日）
    const dateMatch = text.match(/(\d{1,2})月(\d{1,2})日/)
    if (!dateMatch) {
      console.error('未找到日期信息，文本:', text.substring(0, 100))
      return null
    }
    
    const month = parseInt(dateMatch[1])
    const day = parseInt(dateMatch[2])
    
    // 验证日期有效性
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      console.error('日期无效:', { month, day })
      return null
    }
    
    // 当前年份为2026年
    const currentYear = 2026
    
    // 转换为YYYY-MM-DD格式
    const date = `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    // 提取客运量（地铁）- 支持多种格式
    const metroPatterns = [
      /成都地铁客运量([\d.]+)万人次/,
      /客运量([\d.]+)万人次/,
      /地铁客运量([\d.]+)万人次/
    ]
    let metroPassenger = null
    for (const pattern of metroPatterns) {
      const match = text.match(pattern)
      if (match) {
        metroPassenger = parseFloat(match[1])
        break
      }
    }
    
    // 提取市域（郊）铁路客运量 - 对应 lineS3(number)
    const lineS3Patterns = [
      /市域[（(]郊[）)]铁路客运量([\d.]+)万人次/,
      /市域铁路客运量([\d.]+)万人次/,
      /市域\(郊\)铁路客运量([\d.]+)万人次/
    ]
    let lineS3 = null
    for (const pattern of lineS3Patterns) {
      const match = text.match(pattern)
      if (match) {
        lineS3 = parseFloat(match[1])
        break
      }
    }
    
    // 提取有轨电车客运量 - 对应 lineRong2(number)
    const lineRong2Patterns = [
      /有轨电车客运量([\d.]+)万人次/,
      /有轨电车([\d.]+)万人次/
    ]
    let lineRong2 = null
    for (const pattern of lineRong2Patterns) {
      const match = text.match(pattern)
      if (match) {
        lineRong2 = parseFloat(match[1])
        break
      }
    }
    
    // 提取温度信息（如：3-11，3是minTemp，11是maxTemp）
    // 匹配文本末尾的温度格式，如："3-11，晴" 或 "3-11，晴。"
    const tempMatch = text.match(/(\d+)-(\d+)[，,]/)
    let minTemp = null
    let maxTemp = null
    if (tempMatch) {
      minTemp = parseInt(tempMatch[1])
      maxTemp = parseInt(tempMatch[2])
    }
    
    // 提取天气信息（在温度后面，如：3-11，晴 或 3-11，晴。）
    // 匹配温度后面的天气词，支持中英文逗号
    const weatherMatch = text.match(/(\d+)-(\d+)[，,]\s*([^。，,]+?)(?:[。，,]|$)/)
    let weather = null
    if (weatherMatch && weatherMatch[3]) {
      weather = weatherMatch[3].trim()
      // 移除可能的标点符号
      weather = weather.replace(/[。，,、；;：:！!？?]$/, '')
    }
    
    if (metroPassenger === null || isNaN(metroPassenger)) {
      console.error('未能提取地铁客运量')
      return null
    }
    if (lineS3 === null || isNaN(lineS3)) {
      console.error('未能提取市域（郊）铁路客运量')
      return null
    }
    if (lineRong2 === null || isNaN(lineRong2)) {
      console.error('未能提取有轨电车客运量')
      return null
    }
    
    // 确保返回的是数字类型
    return {
      date,
      metroPassenger: Number(metroPassenger),
      lineS3: Number(lineS3),
      lineRong2: Number(lineRong2),
      minTemp: minTemp !== null ? Number(minTemp) : null,
      maxTemp: maxTemp !== null ? Number(maxTemp) : null,
      weather: weather || null
    }
  } catch (error) {
    console.error('解析文本失败:', error)
    return null
  }
}

// 验证解析后的数据
function validateParsedData(data) {
  if (!data) return false
  if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) return false
  if (typeof data.metroPassenger !== 'number' || data.metroPassenger <= 0) return false
  if (typeof data.lineS3 !== 'number' || data.lineS3 < 0) return false
  if (typeof data.lineRong2 !== 'number' || data.lineRong2 < 0) return false
  // 温度和天气是可选的，不需要验证
  return true
}

// 计算客流数据
function calculatePassengerData(parsedData) {
  const { date, metroPassenger, lineS3, lineRong2, minTemp, maxTemp, weather } = parsedData
  
  // 确保输入是数字类型
  const metro = Number(metroPassenger)
  const s3 = Number(lineS3)
  const rong2 = Number(lineRong2)
  
  // 纯客流（pureMetroPassenger）= 客运量（地铁）+ 市域（郊）铁路客运量（lineS3）
  const pureMetroPassenger = (Math.round((metro + s3) * 100) / 100).toFixed(2)
  
  // 总客流（totalPassenger）= 客运量（地铁）+ 市域（郊）铁路客运量（lineS3）+ 有轨电车客运量（lineRong2）
  const totalPassenger = (Math.round((metro + s3 + rong2) * 100) / 100).toFixed(2)
  
  const result = {
    date,
    'lineS3(number)': (Math.round(s3 * 100) / 100).toFixed(2),
    'lineRong2(number)': (Math.round(rong2 * 100) / 100).toFixed(2),
    'pureMetroPassenger(number)': pureMetroPassenger,
    'totalPassenger(number)': totalPassenger
  }
  
  // 添加温度信息（如果存在）
  if (minTemp !== null && maxTemp !== null) {
    result['minTemp(number)'] = String(minTemp)
    result['maxTemp(number)'] = String(maxTemp)
  }
  
  // 添加天气信息（如果存在）
  if (weather) {
    result['weather(string)'] = weather
  }
  
  return result
}

// 保存到数据库
async function saveToDatabase(data) {
  try {
    const { date } = data
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('日期格式不正确: ' + date)
    }
    
    // 检查数据是否已存在（尝试两种日期字段格式）
    let existingRes = await db.collection('passenger_data_update')
      .where({
        date: date
      })
      .get()
    
    // 如果第一种格式没找到，尝试 date(date) 格式
    if (!existingRes.data || existingRes.data.length === 0) {
      existingRes = await db.collection('passenger_data_update')
        .where({
          'date(date)': date
        })
        .get()
    }
    
    if (existingRes.data && existingRes.data.length > 0) {
      console.log('数据已存在，更新数据:', date)
      const existingRecord = existingRes.data[0]
      console.log('现有记录ID:', existingRecord._id)
      
      // 使用 _id 直接更新，更可靠
      let updateRes
      try {
        updateRes = await db.collection('passenger_data_update')
          .doc(existingRecord._id)
          .update({
            data: data
          })
        console.log('更新成功，更新记录数:', updateRes.stats.updated)
      } catch (e) {
        console.error('使用 _id 更新失败，尝试使用 where 条件:', e)
        // 如果使用 _id 失败，尝试使用 where 条件
        try {
          updateRes = await db.collection('passenger_data_update')
            .where({
              date: date
            })
            .update({
              data: data
            })
        } catch (e2) {
          // 如果第一种格式失败，尝试 date(date) 格式
          updateRes = await db.collection('passenger_data_update')
            .where({
              'date(date)': date
            })
            .update({
              data: data
            })
        }
      }
      return {
        action: 'update',
        result: updateRes,
        message: `已更新 ${date} 的数据`,
        updatedCount: updateRes.stats.updated
      }
    } else {
      console.log('数据不存在，插入新数据:', date)
      // 插入新数据
      const addRes = await db.collection('passenger_data_update')
        .add({
          data: data
        })
      return {
        action: 'add',
        result: addRes,
        message: `已插入 ${date} 的新数据`
      }
    }
  } catch (error) {
    console.error('数据库操作失败:', error)
    throw error
  }
}
