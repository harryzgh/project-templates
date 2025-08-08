import {getHuobiPeriodByInterval, getAPITimeRange, getStepByResolution, getOneDaySplitTime, INDEX_KEY} from './chartUtil'
import { eventEmitter, PROJECT_LINEAR_SWAP, PROJECT_UNIT_KEY } from '../../../utils/commonFunction'
import { EXCHANGE_TIMEZONE } from '../../../utils/timeZone'
import {
  KLINE_SUB_DATA_SUCCESS, KLINE_HISTORY_DATA_SUCCESS, KLINE_HISTORY_DATA_FAILURE, REQUEST_KLINE_DATA,
  SUB_KLINE_DATA, UNSUB_KLINE_DATA, REQUEST_KLINE_INDEX_DATA, SUB_KLINE_INDEX_DATA, UNSUB_KLINE_INDEX_DATA
} from './basicChartData'

// 组装k线数据成功
const COMBINE_K_LINE_DATA_SUCCESS = 'combine_k_line_data_success'

class TradingDataFeed {
  constructor (pair, period, symbols, timezone, resolutionKey, projectType, maxBars = 2000) {
    this.pair = pair
    this.period = period
    this.symbols = symbols
    this.timezone = timezone
    this.resolutionKey = resolutionKey
    this.maxBars = maxBars // 服务器那边，一次返回的最多 bars 的数量
    this.serverTime = null
    this.projectType = projectType
    this.barCache = {}
    // 监听事件，按合约分配
    this.onHistoryCallback = {}
    this.onRealtimeCallback = {}
    // subscriberUID 的 map
    this.subscriberMap = []
  }
  setPeriod (period) {
    this.period = period
  }

  /**
   * 获取k线订阅主题
   * @param resolution
   * @returns {string}
   */
  getChannel (symbolInfo, resolution) {
    const key = symbolInfo['symbol_short_type'] || symbolInfo
    let period = '1min'
    if (!resolution) { // unsubscribeBars 的时候需要当前的 channel
      period = this.period
    } else {
      period = getHuobiPeriodByInterval(resolution)
      this.setPeriod(period)
    }
    if (key === INDEX_KEY) {
      const symbol = this.symbols.find(item => item['symbol-short-type'] === key)
        .originSymbol
      const salesUnit = this.projectType === PROJECT_LINEAR_SWAP ? 'USDT' : 'USD'
      return `market.${symbol}-${salesUnit}.index.${period}`
    }
    return `market.${key}.kline.${period}`
  }
  onReady (cb) {
    const configurationData = {
      symbols_types: [],
      supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '5D', '1W', '1M'],
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true
    }
    setTimeout(() => cb(configurationData), 0)
  }

  resolveSymbol (name, onSymbolResolvedCallback, onResolveErrorCallback) {
    setTimeout(() => {
      try {
        const [currentSymbol] = this.symbols.filter(d => d['symbol'] === name)
        if (!currentSymbol) {
          throw new Error('no such symbol')
        }
        onSymbolResolvedCallback({
          name,
          ticker: name,
          description: '',
          session: '24x7',
          minmov: 1,
          pricescale: Number(`1e${currentSymbol['trade-price-precision']}`),
          volume_precision: currentSymbol['trade-amount-precision'],
          timezone: EXCHANGE_TIMEZONE,
          has_intraday: true,
          has_daily: true,
          symbol_short_type: currentSymbol['symbol-short-type'],
          has_weekly_and_monthly: true
        })
      } catch (e) {
        onResolveErrorCallback(e)
      }
    }, 0)
  }

  getBars (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
    // 保存监听事件的回调
    const symbolShortType = symbolInfo['symbol_short_type']
    this.onHistoryCallback[symbolShortType] = onHistoryCallback

    /**
     * 由于 api 那边有每次请求的 bars 的数量限制
     * 并且 tradingview 也不可以手动控制 from 和 to
     * 再加上 tradingview 期望 onHistoryCallback 只是在 [from, to] 之内的数据都准备好的时候调用一次
     *
     * 那么，需要：
     *
     * 1. 把 [from, to] 根据 resolution 切成不同的小时间段
     * 2. 分别请求这些小时间段的数据
     * 3. 组装好，传给 onHistoryCallback
     * 4. 设定一个超时事件，超时之后就 onErrorCallback (//FIXME: 这里可能需要一些更符合场景的处理)
     */

    const range = []
    to = firstDataRequest ? parseInt(+new Date() / 1000, 10) : to

    // 这里拆时间段
    let timeRange = getAPITimeRange(range, from, to, getStepByResolution(resolution, this.maxBars))

    /**
     * 由于后端原因，一天的需要分段请求
     * 每次最多接受2年的数据
     */
    if (getHuobiPeriodByInterval(resolution) === '1day') {
      timeRange = getOneDaySplitTime(timeRange)
    }

    // prefix 是为了在组装数据的时候明白组装数据的来源
    const reqIdPrefix = `${+new Date()}.${timeRange.length}`
    // 发送各个时间段的请求
    timeRange.forEach(({ from, to }, index) => {
      let sendData = {
        id: `${reqIdPrefix}.${index}`,
        req: this.getChannel(symbolInfo, resolution),
        from,
        to
      }
      // 通知界面去请求数据
      if (symbolShortType === INDEX_KEY) {
        eventEmitter.emit(`${this.resolutionKey}${REQUEST_KLINE_INDEX_DATA}`, sendData)
      } else {
        eventEmitter.emit(`${this.resolutionKey}${REQUEST_KLINE_DATA}`, sendData)
      }
    })
    // 接收k线请求数据
    eventEmitter.on(`${this.resolutionKey}${KLINE_HISTORY_DATA_SUCCESS}`, binding => {
      // 这里组装数据
      this.combineBars(binding, resolution, symbolInfo)
    })

    // 接收组装好的k线数据
    eventEmitter.on(`${this.resolutionKey}${COMBINE_K_LINE_DATA_SUCCESS}`, ({ id, rep, bars }) => {
      Object.keys(this.onHistoryCallback).some(key => {
        if (rep && rep.toLowerCase().indexOf(key.toLowerCase()) > -1) {
          const isIndex = rep.toLowerCase().indexOf(INDEX_KEY.toLowerCase()) > -1
          const historyCallbackFn = this.onHistoryCallback[isIndex ? INDEX_KEY : key]
          historyCallbackFn && historyCallbackFn(bars, { noData: !bars.length })
          return true
        }
      })
    })

    // k线数据请求失败处理
    eventEmitter.on(`${this.resolutionKey}${KLINE_HISTORY_DATA_FAILURE}`, reason =>
      onErrorCallback(reason)
    )
  }

  /**
   * 组装k线数据
   * @param id
   * @param data
   * @param resolution
   * @param symbolInfo
   */
  combineBars ({ id, data, rep }, resolution, symbolInfo) {
    if (!id) {
      return
    }

    const [time, total, current] = id.split('.')

    if (!this.barCache[time]) {
      this.barCache[time] = {}
    }

    this.barCache[time][current] = data

    const keys = Object.keys(this.barCache[time])

    if (keys.length === +total) {
      const bars = keys.reduce((soFar, current) =>
        soFar.concat(this.barCache[time][current].map(d => ({
          time: d.id * 1000,
          close: d.close,
          open: d.open,
          high: d.high,
          low: d.low,
          volume: window[PROJECT_UNIT_KEY[this.projectType]] === 'sheet' ? d.vol : Math.ceil(d.amount)
        }))), []
      )
      // 通知k线数据组装完成
      eventEmitter.emit(`${this.resolutionKey}${COMBINE_K_LINE_DATA_SUCCESS}`, { id, bars, rep })
      delete this.barCache[time]
    }
  }

  subscribeBars (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    // 通知界面订阅k线数据
    const symbolShortType = symbolInfo['symbol_short_type']
    if (symbolShortType === INDEX_KEY) {
      eventEmitter.emit(`${this.resolutionKey}${SUB_KLINE_INDEX_DATA}`, {sub: this.getChannel(symbolInfo, resolution)})
    } else {
      eventEmitter.emit(`${this.resolutionKey}${SUB_KLINE_DATA}`, {sub: this.getChannel(symbolInfo, resolution)})
    }
    // 接收k线数据
    this.onRealtimeCallback[symbolShortType] = onRealtimeCallback
    this.subscriberMap.push({
      ...symbolInfo,
      subscriberUID
    })
    eventEmitter.on(`${this.resolutionKey}${KLINE_SUB_DATA_SUCCESS}`, stream => {
      // 判断是否是该symbolInfo的
      Object.keys(this.onHistoryCallback).some(key => {
        if (stream.ch && stream.ch.toLowerCase().indexOf(key.toLowerCase()) > -1) {
          const isIndex = stream.ch.toLowerCase().indexOf(INDEX_KEY.toLowerCase()) > -1
          const tick = stream.tick
          const realtimeCallbackFn = this.onRealtimeCallback[isIndex ? INDEX_KEY : key]
          realtimeCallbackFn && realtimeCallbackFn({
            time: tick.id * 1000,
            close: tick.close,
            open: tick.open,
            high: tick.high,
            low: tick.low,
            volume: window[PROJECT_UNIT_KEY[this.projectType]] === 'sheet' ? tick.vol : Math.ceil(tick.amount)
          })
          return true
        }
      })
    })
  }

  unsubscribeBars (id) {
    // eventEmitter.off('hb.sub')
    // 通知界面取消k线数据订阅
    // 找到对应的订阅对象
    const subscriberItem = this.subscriberMap.find(({ subscriberUID }) => subscriberUID === id)
    const key = subscriberItem['symbol_short_type']
    if (key === INDEX_KEY) {
      eventEmitter.emit(`${this.resolutionKey}${UNSUB_KLINE_INDEX_DATA}`, {unsub: this.getChannel(key)})
    } else {
      eventEmitter.emit(`${this.resolutionKey}${UNSUB_KLINE_DATA}`, {unsub: this.getChannel(key)})
    }
  }

  getServerTime (cb) {
    if (this.serverTime) {
      cb(this.serverTime)
    }
  }
}

export default TradingDataFeed
