/* eslint-disable */
import {StoreUtil} from '../../../utils/storeUtil'

// 交易页面多个k线共用基础变量（引用后在后面加不同的值来进行区分不同k线）
// 有些key保持和以前一样是为了不清除线上用户旧的设置
export const TRADE_KLINE_COMMON_KEY = {
  // 缓存k线品种信息
  KLINE_SYMBOL_DATA: 'kline_symbol_data',
  // tradingview指标缓存key
  CONTRACT_TV_SETTINGS: 'contract-tv-settings',
  // 基础版k线id
  BASE_KLINE_ID: 'k_chart_basic',
  // 专业版（tradingview）k线id
  TRADINGVIEW_ID: 'k_chart_profession',
  // 基础班或者专业版索引缓存key
  CHART_INDEX_STORAGE_KEY: 'chart_index',
  // k线周期缓存key
  TRADE_RESOLUTION_KEY: 'dm::trade::resolution',
  // 周期自选缓存字段
  OWN_SELECTED_STORAGE_FIELD: 'own_selected_interval',
  OWN_SELECTED_VALUE_STORAGE_FIELD: 'own_selected_value',
  // 存在的K线订阅的sub参数列表
  EXIST_KLINE_SUB_KEY_DATA: 'exist_kline_sub_key_data',
  // 存在的指数K线订阅的sub参数列表
  EXIST_INDEX_KLINE_SUB_KEY_DATA: 'exist_index_kline_sub_key_data',
  // window中保存tradingview容器key的列表
  TRADINGVIEW_WIDGET_LIST: 'tradingview_widget_lsit',
  // 绑定再window上的基础版k线 key
  WINDOW_BASE_KLINE_CHAERT_WIDGET_KEY: 'window_base_kline_chart_widget',
  // 绑定再window上的tradingview key
  WINDOW_TRADINGVIEW_CHART_WIDGET_KEY: 'window_tradingview_chart_widget'
}

// 资金费率-溢价指数 缓存key
export const premiumIndexResolutionKey = 'dm::premiumIndex::resolution'
// 资金费率-预估自己费率 缓存key
export const estimatedRateResolutionKey = 'dm::estimatedRate::resolution'
// 标记价格-缓存key
export const markPriceResolutionKey = 'dm::markPrice::resolution'
// 价格指数-指数k线 缓存key
export const priceIndexResolutionKey = 'dm::priceIndex::resolution'
// 网格交易-k线 缓存key
export const gridExKlineResolutionKey = 'dm::gridExKline::resolution'
// 网格交易-预览的k线 缓存key
export const gridExResolutionKey = 'dm::gridEx::resolution'
// 默认自选周期
export const DEFAULT_INTERVAL_SELECTED = ['1m', '5m', '15m', '1H']
export const DEFAULT_INTERVAL_VALUE_SELECTED = '1D'
/**
 * 根据传入的key获取基本版k线的相关元素，做定位调整
 * 因为全局的拖动使用transfrom后，导致基本版k线鼠标悬浮后的标记线定位有问题
 */
export function handleBaseKlinePosition (key, isReset) {
  if (key) {
    const currentGridWrap = document.querySelector(`.react-grid-item-${key.replace('.', '')}`)
    const currentKlineWrap = document.querySelector(`#${TRADE_KLINE_COMMON_KEY.BASE_KLINE_ID}_${key.replace('.', '')}`)
    try {
      if (currentKlineWrap) {
        if (isReset) {
          currentKlineWrap.style.transform = ``
          currentKlineWrap.style.position = ''
          currentKlineWrap.style.left = ``
          currentKlineWrap.style.top = ``
        } else {
          let gridTransform = currentGridWrap.style.transform
          gridTransform = gridTransform.replace('translate(', '').replace(')', '').replace(' ', '').replaceAll('px', '')
          let [translateX, translateY] = gridTransform.split(',')
          currentKlineWrap.style.transform = `translate(-${translateX}px, ${-translateY || 0}px)`
          currentKlineWrap.style.position = 'relative'
          currentKlineWrap.style.left = `${translateX}px`
          currentKlineWrap.style.top = `${translateY}px`
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
}

export function parseResolution (resolution) {
  const [raw, n, u] = resolution.toString().match(/^(\d+)?([SDWM]?)?$/)
  return {
    raw,
    u,
    n: n || 1
  }
}

export function resolutionInSeconds (resolution) {
  const { n, u } = parseResolution(resolution)

  const timeInSeconds = {
    S: 1,
    D: 60 * 60 * 24,
    W: 60 * 60 * 24 * 7,
    M: 60 * 60 * 24 * 30
  }
  // if there is no such unit in the hash above, it means it's in minute.
  // e.g: `15` means "15 minutes", so it's 15 * 60 (in seconds)
  return n * (timeInSeconds[u] || 60)
}

export function getParameterByName (name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
    results = regex.exec(window.location.search)
  return !results ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

/**
 * 这个方法是把火币这边的 period 转换成 kline 中理解的方式
 * huobi period: {1s, 1min, 5min, 15min, 30min, 60min, 1day, 1mon, 1week, 1year}
 * trading period: 1S, 1, 5, 15, 30, 60, 1D, 1W, 12M(1year)
 * 如果输入的格式不符合规则，会直接抛错误出来
 */
export function getIntervalByHuobiPeriod (period) {
  try {
    const [raw, n, u] = period.match(/^(\d+)(s|min|hour|day|mon|week|year)$/)
    switch (u) {
      case 's':
        return `${n}S`
      case 'hour':
        return `${n * 60}`
      case 'day':
        return `${n}D`
      case 'week':
        return `${n}W`
      case 'mon':
        return `${n}M`
      case 'year':
        return `${parseInt(n, 10) * 12}M`
      default:
        return n
    }
  } catch (e) {
    throw ('invalid period: ', period)
  }
}

/**
 * 这个方法是把 kline 这边的 resolution 转换成火币中的 period
 * trading period: 1S, 1, 5, 15, 30, 60, 1D, 1W, 12M(1year)
 * huobi period: {1s, 1min, 5min, 15min, 30min, 60min, 1day, 1mon, 1week, 1year}
 * 如果输入的格式不符合规则，会直接抛错误出来
 */
export function getHuobiPeriodByInterval (resolution) {
  try {
    const {raw, n, u} = parseResolution(resolution)
    switch (u) {
      case 'S':
        return `${n}s`
      case 'D':
        return `${n}day`
      case 'W':
        return `${n}week`
      case 'M':
        if (n % 12 === 0) {
          return `${n / 12}year`
        }
        return `${n}mon`
      default:
        if (n % 60 === 0 && n > 60) { // 针对小时的情况：因为 kline 会把所有的 hour 转成 min 所以需要转回去
          return `${n / 60}hour`
        }
        return `${n}min`
    }
  } catch (e) {
    throw ('invalid resolution: ', resolution)
  }
}

// 每个tab独立维护一个，防止B tab页面周期了，A周期的获取跟周期切换那冲突
// 且给用户造成不好体验
// 这样可以让用户在多个页面同时查看多个周期
const huobiResolutionMap = {}

export const huobiResolution = ({
  get (localStorageResolutionKey) {
    const key = huobiResolutionMap[localStorageResolutionKey] ?
      huobiResolutionMap[localStorageResolutionKey] : localStorage.getItem(localStorageResolutionKey)

    huobiResolutionMap[localStorageResolutionKey] = key
    return key ? key.split('|') : []
  },

  set ({localStorageResolutionKey, interval, chartType = '1' }) {
    const value = `${getHuobiPeriodByInterval(interval)}|${chartType}`
    huobiResolutionMap[localStorageResolutionKey] = value
    localStorage.setItem(localStorageResolutionKey, value)
  }
})

export const getIntervalClass = ({ resolution, chartType = 1 }) => `interval-${resolution}-${chartType}`

// 对于 kline （1） 来说 显示 ma, 而对于 分时（area）来说，不显示 ma
export const shouldShowMAStudiesByChartTypePreset = chartType => chartType.toString() === '1'

/**
 * 切割请求时间数组
 * @param result
 * @param from
 * @param to
 * @param step
 * @returns {*[]}
 */
export const getAPITimeRange = (result, from, to, step) => {
  const validTimeRange = {
    from: 1325347200,
    to: 2524579200
  }

  // 如果 kline 给过来的时间超过了 api 支持的范围，那么就返回一个边界上的点
  if (to < validTimeRange.from) {
    return [{
      from: validTimeRange.from,
      to: validTimeRange.from
    }]
  }

  if (from > validTimeRange.to) {
    return [{
      from: validTimeRange.to,
      to: validTimeRange.to
    }]
  }

  if (from < validTimeRange.from) {
    from = validTimeRange.from
  }

  if (to > validTimeRange.to) {
    to = validTimeRange.to
  }

  return (function cutTime (from, step) {
    if (from + step > to) {
      result.push({
        from,
        to
      })

      return result
    }

    result.push({
      from,
      to: from + step
    })

    return cutTime(from + step + 1, step)
  }(from, step))
}

/**
 *
 * @param resolution
 * @param maxBars
 * @returns {number}
 */
export const getStepByResolution = (resolution, maxBars) => {
  return resolutionInSeconds(resolution) * maxBars
}

/**
 * 1day的分段数据
 */
const YEAR_SECOND = 60 * 60 * 24 * 364 // 一年的秒数
export const getOneDaySplitTime = (timeRange) => {
  const timeRangeSplit = []
  timeRange.forEach(({ from, to }) => {
    const oneYearAgoSecond = to - YEAR_SECOND // 一年前的时间
    if (oneYearAgoSecond >= from) {
      // 超过一年，需要分片
      timeRangeSplit.push(...getOneDaySplitTime([{ from, to: oneYearAgoSecond - 1 }]))
      timeRangeSplit.push({ from: oneYearAgoSecond, to })
    } else {
      timeRangeSplit.push({ from, to })
    }
  })
  return timeRangeSplit
}

/**
 * 获取所有/当前商品的指标缓存信息
 * @param currentGoods: 当前商品
 * @param newVersion: 用于清除指标参数等本地缓存
 * @returns {any[]}
 */
export const getGoodsStudies = (currentGoods, newVersion, klineIndexKey) => {
  // 所有商品缓存的指标参数
  let studies = JSON.parse(StoreUtil.getStorage(klineIndexKey))
  const isNewVersion = studies && studies['version'] && studies['version'] === newVersion

  if (!isNewVersion) {
    // 不是最新的，需要清除
    studies = {
      version: newVersion
    }
  }

  // 当前商品缓存的指标参数
  const currentGoodsStudy = (studies && studies[currentGoods]) || null
  return [studies, currentGoodsStudy]
}

// 指数价key
export const INDEX_KEY = 'Index'

// newVersion 用于清除指标参数等本地缓存, 如果某个版本上线需要强制清除缓存的指标
// 则改newVersion的值即可
export const newVersion = 'V4.2.1'

/**
 * 设置k线的缓存合约
 * @param {*} key 每个k线的组件key
 * @param {*} value 合约的contract_code字段
 */
export const setKlineSymbolData = (key, value) => {
  let klineSymbolData = StoreUtil.getStorage(TRADE_KLINE_COMMON_KEY.KLINE_SYMBOL_DATA)
  klineSymbolData = klineSymbolData ? JSON.parse(klineSymbolData) : {}
  klineSymbolData[key] = value
  StoreUtil.setStorage(TRADE_KLINE_COMMON_KEY.KLINE_SYMBOL_DATA, JSON.stringify(klineSymbolData))
}

/**
 * 获取k线对应的缓存合约
 * @param {*} key 每个k线的组件key
 */
export const getKlineSymbolData = (key) => {
  let klineSymbolData = StoreUtil.getStorage(TRADE_KLINE_COMMON_KEY.KLINE_SYMBOL_DATA)
  klineSymbolData = klineSymbolData ? JSON.parse(klineSymbolData) : {}
  return klineSymbolData[key]
}
