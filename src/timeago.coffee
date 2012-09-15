# Smart Time Ago v0.1.1

# Copyright 2012, Terry Tai, Pragmatic.ly
# https://pragmatic.ly/
# Licensed under the MIT license.
# https://github.com/pragmaticly/smart-time-ago/blob/master/LICENSE

class TimeAgo

  constructor: (element, options) ->
    @startInterval = 60000
    @init(element, options)

  init: (element, options) ->
    @$element = $(element)
    @options = $.extend({}, $.fn.timeago.defaults, options)
    @updateTime()
    @startTimer()

  startTimer: ->
    self = @
    @interval = setInterval ( ->
      self.refresh()
    ), @startInterval

  stopTimer: ->
    clearInterval(@interval)

  restartTimer: ->
    @stopTimer()
    @startTimer()

  refresh: ->
    @updateTime()
    @updateInterval()

  updateTime: ->
    self = @
    @$element.findAndSelf(@options.selector).each ->
      timeAgoInWords = self.timeAgoInWords($(this).attr(self.options.attr))
      $(this).html(timeAgoInWords)

  updateInterval: ->
    if @$element.findAndSelf(@options.selector).length > 0
      if @options.dir is "up"
        filter = ":first"
      else if @options.dir is "down"
        filter = ":last"
      newestTimeSrc = @$element.findAndSelf(@options.selector).filter(filter).attr(@options.attr)
      newestTime = @parse(newestTimeSrc)
      newestTimeInSeconds = @getTimeDistanceInSeconds(newestTime)

      if newestTimeInSeconds >= 0 and newestTimeInSeconds < 2700 and @startInterval != 60000 #1 minute
        @startInterval = 60000
        @restartTimer()
      else if newestTimeInSeconds >= 2700 and newestTimeInSeconds < 5400 and @startInterval != 60000 * 22 #22 minutes
        @startInterval = 60000 * 22
        @restartTimer()
      else if newestTimeInSeconds >= 5400 and newestTimeInSeconds < 151200 and @startInterval != 60000 * 30 #half hour
        @startInterval = 60000 * 30
        @restartTimer()
      else if newestTimeInSeconds >= 151200 and @startInterval != 60000 * 60 * 12 #half day
        @startInterval = 60000 * 60 * 12
        @restartTimer()

  timeAgoInWords: (timeString) ->
    absolutTime = @parse(timeString)
    suffix = @options.suffix or @options.lang.suffix
    "#{@options.lang.prefixes.ago}#{@distanceOfTimeInWords(absolutTime)}#{suffix}"

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
    dim = @getTimeDistanceInSeconds(absolutTime) #distance in minutes
    space = if @options.spacing then ' ' else ''

    if dim < 60
      "#{ if @options.approximate then @options.lang.prefixes.lt + " " else "1" + space }#{ @options.lang.units.minute }"
    else if dim < 120
      "1#{ space }#{ @options.lang.units.minute }"
    else if dim < 2700
      "#{ Math.round(dim / 60) }#{ space }#{ @options.lang.units.minutes }"
    else if dim < 5400
      "#{ if @options.approximate then @options.lang.prefixes.about + " " else ""  }1#{ space }#{ @options.lang.units.hour }"
    else if dim < 86400
      "#{ if @options.approximate then @options.lang.prefixes.about + " " else "" }#{ Math.round(dim / 3600) }#{ space }#{ @options.lang.units.hours }"
    else if dim < 151200
      "1#{ space }#{ @options.lang.units.day }"
    else if dim < 2592000
      "#{ Math.round(dim / 86400) }#{ space }#{ @options.lang.units.days }"
    else if dim < 5184000
      "#{ if @options.approximate then @options.lang.prefixes.about + " " else "" }1#{ space }#{ @options.lang.units.month }"
    else if dim < 31536000 #1 yr
      "#{ Math.round(dim / 2592000) }#{ space }#{ @options.lang.units.months }"
    else if dim < 39312000 #1 yr, 3 months
      "#{ if @options.approximate then @options.lang.prefixes.about + " " else "" }1#{ space }#{ @options.lang.units.year }"
    else if dim < 54864000 #1 yr, 9 months
      "#{ if @options.approximate then @options.lang.prefixes.over + " " else "" }1#{ space }#{ @options.lang.units.year }"
    else if dim < 63072000 #2 yr minus half minute
      "#{ if @options.approximate then @options.lang.prefixes.almost + " " else "" }2#{ space }#{ @options.lang.units.years }"
    else
      "#{ if @options.approximate then @options.lang.prefixes.about + " " else "" }#{ Math.round(dim / 31536000) }#{ space }#{ @options.lang.units.years }"

$.fn.timeago = (options = {}) ->
  @each ->
    $this = $(this)
    data = $this.data("timeago")
    if (!data)
      $this.data("timeago", new TimeAgo(this, options))
    if (typeof options is 'string')
      data[options]()

$.fn.findAndSelf = (selector) ->
  this.find(selector).add(this.filter(selector))

$.fn.timeago.Constructor = TimeAgo

$.fn.timeago.defaults =
  selector: 'time.timeago'
  attr: 'datetime'
  spacing: true
  approximate: true
  dir: 'up'
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
      lt: "less than a"
      about: "about"
      over: "over"
      almost: "almost"
      ago: ""
    suffix: ' ago'

