# Smart Time Ago v0.0.1

# Copyright 2012, Terry Tai, Pragmatic.ly
# https://pragmatic.ly/
# Licensed under the MIT license.
# https://github.com/pragmaticly/smart-time-ago/blob/master/LICENSE

class TimeAgo
  constructor: (element, options) ->
    @startInterval = 5000
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
      newestTimeInMinutes = @getTimeDistanceInMinutes(newestTime)
      newestTimeInSeconds = newestTimeInMinutes * 60
      if newestTimeInMinutes <= 1
        if newestTimeInSeconds <= 9 and @startInterval != 5000 #5 seconds
          @startInterval = 5000
          restartTimer()
        else if newestTimeInSeconds <= 59 and @startInterval != 10000 #10 seconds
          @startInterval = 10000
          restartTimer()
      else if newestTimeInMinutes >= 2 and newestTimeInMinutes <= 45 and @startInterval != 60000 #1 minute
        @startInterval = 60000
        @restartTimer()
      else if newestTimeInMinutes >= 46 and newestTimeInMinutes <= 89 and @startInterval != 60000 * 30 #30 minutes
        @startInterval = 60000 * 30
        @restartTimer()
      else if newestTimeInMinutes >= 90 and newestTimeInMinutes <= 2519 and @startInterval != 60000 * 60 #1 hour
        @startInterval = 60000 * 60
        @restartTimer()
      else if newestTimeInMinutes >= 2520 and @startInterval != 60000 * 60 * 24 #1 day
        @startInterval = 60000 * 60 * 24
        @restartTimer()

  timeAgoInWords: (timeString) ->
    absolutTime = @parse(timeString)
    distanceInMinutes = @getTimeDistanceInMinutes(absolutTime)
    @distanceOfTimeInWords(distanceInMinutes) + " #{@options.suffix}"

  parse: (iso8601) ->
    timeStr = $.trim(iso8601)
    timeStr = timeStr.replace(/\.\d\d\d+/,"")
    timeStr = timeStr.replace(/-/,"/").replace(/-/,"/")
    timeStr = timeStr.replace(/T/," ").replace(/Z/," UTC")
    timeStr = timeStr.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2")
    new Date(timeStr);

  getTimeDistanceInMinutes: (absolutTime) ->
    timeDistance = new Date().getTime() - absolutTime.getTime()
    Math.round((Math.abs(timeDistance) / 1000) / 60.0)

  distanceOfTimeInWords: (dim) ->
    #TODO support i18n.
    dis = Math.round(distanceInMinutes * 60) #distance in seconds

    if dim <= 1
      if dis <= 4
        "less than 5 seconds"
      else if dis >= 5 and dis <= 9
        "less than 10 seconds"
      else if dis >= 10 and dis <= 19
        "less than 20 seconds"
      else if dis >= 20 and dis <= 39
        "half a minute"
      else if dis >= 40 and dis <= 59
        "less than a minute"
      else
        "1 minute"
    else if dim >= 2 and dim <= 44
      "#{ dim } minutes"
    else if dim >= 45 and dim <= 89
      "about 1 hour"
    else if dim >= 90 and dim <= 1439
      "about #{ Math.round(dim / 60.0) } hours"
    else if dim >= 1440 and dim <= 2519
      "1 day"
    else if dim >= 2520 and dim <= 43199
      "#{ Math.round(dim / 1440.0) } days"
    else if dim >= 43200 and dim <= 86399
      "about 1 month"
    else if dim >= 86400 and dim <= 525599 #1 yr
      "#{ Math.round(dim / 43200.0) } months"
    else if dim >= 525600 and dim <= 655200 #1 yr, 3 months
      "about 1 year"
    else if dim >= 655201 and dim <= 914400 #1 yr, 9 months
      "over 1 year"
    else if dim >= 914400 and dim <= 1051200 #2 yr minus half minute
      "almost 2 years"
    else
      "about #{ Math.round(dim / 525600.0) } years"

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
  dir: 'up'
  suffix: 'ago'
