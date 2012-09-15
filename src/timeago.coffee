# Smart Time Ago v0.1.1

# Copyright 2012, Terry Tai, Pragmatic.ly
# https://pragmatic.ly/
# Licensed under the MIT license.
# https://github.com/pragmaticly/smart-time-ago/blob/master/LICENSE

class TimeAgo

  constructor: (element, options) ->
    @$element = $(element)
    @options = $.extend({}, $.fn.timeago.defaults, options)
    @refresh()

  startTimer: ->
    @interval = setInterval(@refresh.bind(@), @startInterval)

  stopTimer: ->
    clearInterval(@interval)

  restartTimer: ->
    @stopTimer()
    @startTimer()

  refresh: ->
    @updateTime()
    @updateInterval()

  updateTime: ->
    timeAgoInWords = @timeAgoInWords(@$element.attr(@options.attr))
    @$element.html(timeAgoInWords)

  updateInterval: ->
    newestTimeSrc = @$element.attr(@options.attr)
    newestTime = @parse(newestTimeSrc)
    dis = @getTimeDistanceInSeconds(newestTime)

    if @options.showSeconds and @options.showNow and dis < @options.showNow
      @startInterval = (@options.showNow - dis) * 1000
      @restartTimer()
    else if @options.showSeconds and dis < 60
      @startInterval = 1000
      @restartTimer()
    else if dis < 2700
      @startInterval = (60 - dis % 60) * 1000
      @restartTimer()
    else if dis < 5400
      @startInterval = (5400 - dis) * 1000
      @restartTimer()
    else if dis < 151200
      @startInterval = (3600 - dis % 3600) * 1000
      @restartTimer()
    else
      @startInterval = (86400 - dis % 86400) * 1000
      @restartTimer()

  timeAgoInWords: (timeString) ->
    absolutTime = @parse(timeString)
    words = @distanceOfTimeInWords(absolutTime)
    if words == @options.lang.prefixes.now
      ago = ""
      suffix = ""
    else
      ago = @options.lang.prefixes.ago
      suffix = @options.suffix or @options.lang.suffix
    "#{ago}#{words}#{suffix}"

  parse: (iso8601) ->
    timeStr = $.trim(iso8601)
    timeStr = timeStr.replace(/\.\d\d\d+/,"")
    timeStr = timeStr.replace(/-/,"/").replace(/-/,"/")
    timeStr = timeStr.replace(/T/," ").replace(/Z/," UTC")
    timeStr = timeStr.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2")
    new Date(timeStr)

  getTimeDistanceInSeconds: (absolutTime) ->
    timeDistance = new Date().getTime() - absolutTime.getTime()
    Math.round(Math.abs(timeDistance) / 1000)

  distanceOfTimeInWords: (absolutTime) ->
    #TODO support i18n.
    dis = @getTimeDistanceInSeconds(absolutTime) #distance in minutes
    space = if @options.spacing then ' ' else ''

    if dis < 60
      if @options.showSeconds
        if @options.showNow and @options.showNow > dis
          @options.lang.prefixes.now
        else if dis == 0 or dis == 1
          "1#{ space }#{ @options.lang.units.second }"
        else
          "#{ dis }#{ space }#{ @options.lang.units.seconds }"
      else
        "#{ if @options.approximate then @options.lang.prefixes.lt + " " else "1" + space }#{ @options.lang.units.minute }"
    else if dis < 120
      "1#{ space }#{ @options.lang.units.minute }"
    else if dis < 2700
      "#{ Math.round(dis / 60) }#{ space }#{ @options.lang.units.minutes }"
    else if dis < 5400
      "#{ if @options.approximate then @options.lang.prefixes.about + " " else ""  }1#{ space }#{ @options.lang.units.hour }"
    else if dis < 86400
      "#{ if @options.approximate then @options.lang.prefixes.about + " " else "" }#{ Math.round(dis / 3600) }#{ space }#{ @options.lang.units.hours }"
    else if dis < 151200
      "1#{ space }#{ @options.lang.units.day }"
    else if dis < 2592000
      "#{ Math.round(dis / 86400) }#{ space }#{ @options.lang.units.days }"
    else if dis < 5184000
      "#{ if @options.approximate then @options.lang.prefixes.about + " " else "" }1#{ space }#{ @options.lang.units.month }"
    else if dis < 31536000 #1 yr
      "#{ Math.round(dis / 2592000) }#{ space }#{ @options.lang.units.months }"
    else if dis < 39312000 #1 yr, 3 months
      "#{ if @options.approximate then @options.lang.prefixes.about + " " else "" }1#{ space }#{ @options.lang.units.year }"
    else if dis < 54864000 #1 yr, 9 months
      "#{ if @options.approximate then @options.lang.prefixes.over + " " else "" }1#{ space }#{ @options.lang.units.year }"
    else if dis < 63072000 #2 yr minus half minute
      "#{ if @options.approximate then @options.lang.prefixes.almost + " " else "" }2#{ space }#{ @options.lang.units.years }"
    else
      "#{ if @options.approximate then @options.lang.prefixes.about + " " else "" }#{ Math.round(dis / 31536000) }#{ space }#{ @options.lang.units.years }"

$.fn.timeago = (options = {}) ->
  @each ->
    $this = $(this)
    attr = $this.attr(options.attr or $.fn.timeago.defaults.attr)
    if attr == undefined or attr == false
      return

    data = $this.data("timeago")
    if (!data)
      $this.data("timeago", new TimeAgo(this, options))

$.fn.timeago.Constructor = TimeAgo

$.fn.timeago.defaults =
  attr: 'datetime'
  spacing: true
  approximate: true
  showSeconds: false
  showNow: false
  lang:
    units:
      second: "second"
      seconds: "seconds"
      minute: "minute"
      minutes: "minutes"
      hour: "hour"
      hours: "hours"
      day: "day"
      days: "days"
      month: "month"
      months: "months"
      year: "year"
      years: "years"
    prefixes:
      now: "just now"
      lt: "less than a"
      about: "about"
      over: "over"
      almost: "almost"
      ago: ""
    suffix: ' ago'

