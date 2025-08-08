import {
  getIntervalByHuobiPeriod, getIntervalClass, getParameterByName,
  huobiResolution, shouldShowMAStudiesByChartTypePreset,
  getGoodsStudies,
  newVersion
} from './chartUtil'
import { defaultThemesGreen, defaultThemesRed, getOverridesByThemeName, populateTheme } from './tradingViewTheme'
import { RED_GREEN_DIRECTION, shouldUseMobileType } from '../../../utils/commonFunction'
import TradingDataFeed from './tradingDataFeed'
import { StoreUtil } from '../../../utils/storeUtil'
import { COMMON_COLOR } from '../../../utils/commonConstant'

// const indicators = ['Accumulation/Distribution', 'Accumulative Swing Index', 'Advance/Decline', 'Arnaud Legoux Moving Average', 'Aroon', 'Average Directional Index', 'Average True Range', 'Awesome Oscillator', 'Balance of Power', 'Bollinger Bands', 'Bollinger Bands %B', 'Bollinger Bands Width', 'Chaikin Money Flow', 'Chaikin Oscillator', 'Chande Kroll Stop', 'Chande Momentum Oscillator', 'Chop Zone', 'Choppiness Index', 'Commodity Channel Index', 'Connors RSI', 'Coppock Curve', 'Correlation Coeff', 'Detrended Price Oscillator', 'Directional Movement Index', 'Donchian Channels', 'Double Exponential Moving Average', 'Ease of Movement', 'Elders Force Index', 'EMA Cross', 'Envelope', 'Fisher Transform', 'Historical Volatility', 'Hull MA', 'Ichimoku Cloud', 'Keltner Channels', 'Klinger Oscillator', 'Know Sure Thing', 'Least Squares Moving Average', 'Linear Regression Curve', 'MA Cross', 'MA with EMA Cross', 'Mass Index', 'McGinley Dynamic', 'Momentum', 'Money Flow', 'Moving Average', 'Moving Average Channel', 'MACD', 'Moving Average Exponential', 'Moving Average Weighted', 'Net Volume', 'On Balance Volume', 'Parabolic SAR', 'Price Channel', 'Price Oscillator', 'Price Volume Trend', 'Rate Of Change', 'Relative Strength Index', 'Relative Vigor Index', 'Relative Volatility Index', 'SMI Ergodic Indicator/Oscillator', 'Smoothed Moving Average', 'Stochastic', 'Stochastic RSI', 'TRIX', 'Triple EMA', 'True Strength Indicator', 'Ultimate Oscillator', 'VWAP', 'VWMA', 'Volume Oscillator', 'Vortex Indicator', 'Willams %R', 'Williams Alligator', 'Williams Fractals', 'Volume', 'Zig Zag', 'SuperTrend', 'Pivot Points Standard', 'Spread', 'Ratio']
const indicators = ['Moving Average', 'MACD', 'Bollinger Bands']
const themeRedGreen = {
  white: {
    green: '#0DA88B',
    red: COMMON_COLOR.RED
  },
  blue: {
    green: '#41B37D',
    red: COMMON_COLOR.RED
  },
  black: {
    green: '#05C19E',
    red: '#E04545'
  }
}
const useMobileType = shouldUseMobileType()

class TradingViewWidget extends window.TradingView.widget {
  // theme should be like:
  // { 'hb-blue': { style: {...}, url: 'some.css' },... }
  // 其中 style 是样式 url 是用来修改 toolbar 之类的 css
  constructor ({// base, quote,
    wsSymbolTopic,
    symbol,
    period,
    chartType, // chartType 定义请见 tradingview 文档 // shortcut: 1 是 K 线 3 是分时 (area)
    props,
    toolbarColor,
    themes,
    themeName,
    lang,
    symbols,
    timezone,
    klineIndexKey,
    redGreenDirection,
    projectType,
    tradeResolutionKey
  }) {
    themes = redGreenDirection === RED_GREEN_DIRECTION.GREEN ? defaultThemesGreen : defaultThemesRed
    // base = getParameterByName('base') || base
    // quote = getParameterByName('quote') || quote
    period = getParameterByName('period') || period
    lang = getParameterByName('lang') || lang || 'en'
    const {overrides, url, studiesOverrides} = getOverridesByThemeName(themes, themeName)
    if (chartType !== undefined) {
      overrides['mainSeriesProperties.style'] = parseInt(chartType, 10)
    }
    //
    let disableFeatures = [
      'compare_symbol',
      'display_market_status',
      'go_to_date',
      'header_chart_type',
      'header_compare',
      'header_interval_dialog_button',
      'header_resolutions',
      'header_screenshot',
      'header_symbol_search',
      'header_undo_redo',
      'legend_context_menu',
      'show_hide_button_in_legend',
      'show_interval_dialog_on_key_press',
      'snapshot_trading_drawings',
      'symbol_info',
      // 'use_localstorage_for_settings',
      'timeframes_toolbar', // 屏蔽时区设置按钮
      'volume_force_overlay',
      'header_widget'
      // 'timeframes_toolbar'
    ]
    let [studies, currentGoodsStudy] = getGoodsStudies(wsSymbolTopic, newVersion, klineIndexKey)
    // 当前合约缓存了Volume指标，则采用createStudy创建Volume
    if (currentGoodsStudy) {
      // 配置 不创建Volume指标
      disableFeatures.push('create_volume_indicator_by_default')
    }

    // 修改k线数量组件的缓存颜色
    if (currentGoodsStudy && currentGoodsStudy.panes && currentGoodsStudy.panes.length) {
      const panes = currentGoodsStudy.panes
      panes.forEach(item => {
        if (item.sources && item.sources.length) {
          item.sources.forEach(source => {
            if (source && source.state && source.state.description === 'Volume') {
              source.state.palettes.volumePalette.colors = [
                {
                  color: redGreenDirection === RED_GREEN_DIRECTION.RED ? themeRedGreen[themeName].green : themeRedGreen[themeName].red,
                  width: 1,
                  style: 0,
                  name: 'Falling'
                },
                {
                  color: redGreenDirection === RED_GREEN_DIRECTION.GREEN ? themeRedGreen[themeName].green : themeRedGreen[themeName].red,
                  width: 1,
                  style: 0,
                  name: 'Growing'
                }
              ]
            }
          })
        }
      })
    }
    // 用户设置自定义属性后，要判断颜色是否自定义，没有就跟着涨跌色走
    let mainSeriesProperties = StoreUtil.getStorage('tradingview.chartproperties.mainSeriesProperties')
    if (mainSeriesProperties) {
      let colorList = ['#0DA88B', COMMON_COLOR.RED, '#41B37D', COMMON_COLOR.RED, '#05C19E', '#E04545']
      mainSeriesProperties = JSON.parse(mainSeriesProperties)
      let candleStyle = mainSeriesProperties.candleStyle
      let upColor = candleStyle.upColor
      let downColor = candleStyle.downColor
      let borderUpColor = candleStyle.borderUpColor
      let borderDownColor = candleStyle.borderDownColor
      let wickUpColor = candleStyle.wickUpColor
      let wickDownColor = candleStyle.wickDownColor
      const changeColor = (upColor, downColor, upProps, downProps) => {
        if (colorList.find(color => color === upColor) && colorList.find(color => color === downColor)) {
          mainSeriesProperties.candleStyle[upProps] = themeRedGreen[themeName][redGreenDirection]
          mainSeriesProperties.candleStyle[downProps] = themeRedGreen[themeName][redGreenDirection === RED_GREEN_DIRECTION.RED ? RED_GREEN_DIRECTION.GREEN : RED_GREEN_DIRECTION.RED]
        }
      }
      // 更新k线条颜色
      changeColor(upColor, downColor, 'upColor', 'downColor')
      // 更新k线条边框颜色
      changeColor(borderUpColor, borderDownColor, 'borderUpColor', 'borderDownColor')
      // 更新k线中间线颜色
      changeColor(wickUpColor, wickDownColor, 'wickUpColor', 'wickDownColor')
      StoreUtil.setStorage('tradingview.chartproperties.mainSeriesProperties', JSON.stringify(mainSeriesProperties))
    }

    // 价格精度
    const symbolConfig = symbols && symbols.find((item) => {
      let itemSymbol = item.symbol
      return itemSymbol === symbol
    })
    const precision = symbolConfig ? symbolConfig['trade-price-precision'] * 1 : 4
    // 设置指标价格精度
    const defaultPrecisionOverrides = {}
    indicators.forEach(name => {
      defaultPrecisionOverrides[`${name}.precision`] = precision
    })
    // defaultPrecisionOverrides['Volume.precision'] = 0
    // defaultPrecisionOverrides['Volume.precision'] = symbolConfig ? symbolConfig['trade-amount-precision'] * 1 : 4
    //
    const defaultOptions = {
      // symbol: `${base.toUpperCase()}/${quote.toUpperCase()}`,
      symbol: symbol,
      fullscreen: true,
      interval: getIntervalByHuobiPeriod(period),
      container_id: props.container_id,
      datafeed: new TradingDataFeed(
        wsSymbolTopic,
        period,
        symbols,
        timezone,
        tradeResolutionKey,
        projectType
      ),
      // 显示的时间格式化
      customFormatters: {
        timeFormatter: {
          format: (date) => {
            const hour = date.getUTCHours()
            const minute = date.getUTCMinutes()
            return `${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute}`
          }
        },
        dateFormatter: {
          format: (date) => {
            const year = date.getUTCFullYear()
            const month = date.getUTCMonth() + 1
            const day = date.getUTCDate()
            return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`
          }
        }
      },
      library_path: '/charting_library/',
      timezone: timezone,
      auto: true,
      // 语言包可以在 $tradingviewRoot/static/localization/translations 中扩展，只需要 locale 和文件名对应好就可以了
      locale: lang || 'zh-CN',
      // Regression Trend-related functionality is not implemented yet, so it's hidden for a while
      drawings_access: {type: 'black', tools: [{name: 'Regression Trend'}]},
      disabled_features: disableFeatures,
      enabled_features: [
        'dont_show_boolean_study_arguments',
        'hide_last_na_study_output',
        'move_logo_to_main_pane',
        'same_data_requery',
        'side_toolbar_in_fullscreen_mode',
        'disable_resolution_rebuild',
        useMobileType ? '' : 'hide_left_toolbar_by_default', // 手机版隐藏左侧菜单
        // 'use_localstorage_for_settings',
        'keep_left_toolbar_visible_on_small_screens'
      ],
      custom_css_url: url,
      toolbar_bg: toolbarColor ? toolbarColor : 'transparent',
      overrides,
      studies_overrides: {
        ...studiesOverrides,
        ...defaultPrecisionOverrides
      },
      // k线本地缓存delay时间（单位 s）
      auto_save_delay: 0.01
    }
    const options = Object.assign({}, defaultOptions, props)
    // super以上不能使用this
    super(options)
    // 设置指标的timer
    this.setCurrentGoodsStudyTimer = null
    this.klineIndexKey = klineIndexKey
    this.tradeResolutionKey = tradeResolutionKey
    this.symbol = options.symbol
    this.themes = populateTheme(themes)
    this.maStudies = []
    this.changingInterval = false
    this.chartType = chartType || 1
    this.selectedIntervalClass = getIntervalClass({
      resolution: getIntervalByHuobiPeriod(period),
      chartType: this.chartType
    })

    /**
     * 设置清除指标的版本
     */
    this.clearStudies = () => {
      studies = {
        version: newVersion
      }
    }

    /**
     * 给当前商品设置指标
     */
    this.setCurrentGoodsStudyDone = false
    this.setCurrentGoodsStudy = () => {
      this.setCurrentGoodsStudyTimer && clearTimeout(this.setCurrentGoodsStudyTimer)
      this.setCurrentGoodsStudyTimer = setTimeout(() => {
        try {
          const _chart = this.chart()
          _chart.executeActionById('drawingToolbarAction')
          const colors = [
            '#965fc4',
            '#84aad5',
            '#55b263',
            '#b7248a'
          ]

          // 没有缓存指标，新建默认指标
          if (!currentGoodsStudy) {
            [5, 10, 30, 60].forEach((d, i) => {
              _chart.createStudy('Moving Average', false, false, [d], id => this.maStudies.push(id), {
                'plot.color.0': colors[i],
                'precision': precision
              })
            })
          } else {
            _chart.applyStudyTemplate(currentGoodsStudy)
          }
          this.setCurrentGoodsStudyDone = true
        } catch (error) {
          this.setCurrentGoodsStudy()
        }
      }, 50)
    }
    this.setCurrentGoodsStudy()

    this.onChartReady(() => {
      if (useMobileType) {
        // 手机版默认收起合约标题
        try {
          let klineIframe = document.querySelector('#k_chart_profession').children[0]
          let klineDocument = klineIframe.contentWindow.document
          let paneLegendMinbtn = klineDocument.querySelector('.pane-legend-minbtn')
          paneLegendMinbtn && paneLegendMinbtn.click()
        } catch (e) {
          console.log(e)
        }
      }
      // -----------------------------------指标缓存
      // 加载当前合约k线指标
      // this.load(currentGoodsStudy)
      // 监听tradingview参数保存事件
      this.subscribe('onAutoSaveNeeded', (result) => {
        this.save((obj) => {
          if (!this.setCurrentGoodsStudyDone) {
            return
          }
          let charts = (obj.charts && obj.charts[0]) || null
          if (!studies) studies = {}
          if (charts && charts.panes && charts.panes.length) {
            const panes = charts.panes
            panes.forEach(item => {
              if (item.sources && item.sources.length) {
                item.sources.forEach(source => {
                  if (source && source.state) {
                    if (source.state.description === 'Volume') {
                      source.state.precision = 0
                      return
                    }
                    source.state.precision = precision
                  }
                })
              }
            })
          }
          studies[wsSymbolTopic] = charts
          StoreUtil.setStorage(this.klineIndexKey, JSON.stringify(studies))
        })
      })
      // -----------------------------------指标缓存

      const setMAStudiesVisibility = visibility => this.chart().getAllStudies().length > 1 && this.maStudies.forEach(studyId => {
        if (this.chart().getAllStudies().filter(i => i.id === studyId).length) {
          this.chart().getStudyById(studyId).setVisible(visibility)
        }
      })
      // const setMAStudiesVisibility = visibility => this.maStudies.forEach(studyId => this.chart().setEntityVisibility(studyId, visibility))
      setMAStudiesVisibility(shouldShowMAStudiesByChartTypePreset(this.chartType))

      this.chart().onIntervalChanged().subscribe(null, (interval, obj) => {
        this.changingInterval = false
      })

      this.onContextMenu((unixtime, price) => {
        return [
          { text: '-Objects Tree...' },
          { text: '-Drawing Tools' },
          { text: '-Hide Marks On Bars' },
          { text: '-Change Symbol...' },
          { text: '-Change Interval...' }
        ]
      })
    })
  }

  /**
   * 设置主题
   * @param name 主题名字
   */
  setTheme (name) {
    // 这里需要设定 canvas 部分的 overrids 和
    // svg 部分的 css
    const theme = name ? this.themes[name] : undefined
    if (theme) {
      let storageOverrides = localStorage.getItem('tradingview.chartproperties.mainSeriesProperties')
      storageOverrides = (storageOverrides && JSON.parse(storageOverrides))
      let overrides = theme.overrides
      // 有本地缓存，使用缓存和本地配置中paneProperties/scalesProperties/volumePaneSize三个属性的值进行k线样式覆盖
      if (storageOverrides) {
        Object.keys(overrides).forEach((key) => {
          if (!(key.includes('paneProperties') || key.includes('scalesProperties') || key.includes('volumePaneSize'))) {
            delete overrides[key]
          }
        })
      }
      this.applyOverrides(overrides)
      if (this.themes[name].url) {
        this.addCustomCSSFile(this.themes[name].url)
      }
    }
  }

  /**
   * 设置当前商品（合约 EOS0623 / 期权 等）
   * @param currentGoods
   */
  setCurrentGoods (currentGoods) {
    // const contract = JSON.parse(localStorage.getItem('contract')).contract_short_type
    // let [, currentGoodsStudy] = getGoodsStudies(contract, newVersion)
    const [period = '15min'] = huobiResolution.get(this.tradeResolutionKey)
    this.symbol = currentGoods
    try {
      // this.setCurrentGoodsStudy(currentGoodsStudy)
      // 设置当前商品
      this.setSymbol(currentGoods, getIntervalByHuobiPeriod(period))
    } catch (error) {
      console.log(error)
    }
  }
}

export default TradingViewWidget
