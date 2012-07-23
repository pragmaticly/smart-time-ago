# Smart Time Ago v0.0.2

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
      newestTimeInMinutes = @getTimeDistanceInMinutes(newestTime)

      if newestTimeInMinutes >= 0 and newestTimeInMinutes <= 44 and @startInterval != 60000 #1 minute
        @startInterval = 60000
        @restartTimer()
      else if newestTimeInMinutes >= 45 and newestTimeInMinutes <= 89 and @startInterval != 60000 * 22 #22 minutes
        @startInterval = 60000 * 22
        @restartTimer()
      else if newestTimeInMinutes >= 90 and newestTimeInMinutes <= 2519 and @startInterval != 60000 * 30 #half hour
        @startInterval = 60000 * 30
        @restartTimer()
      else if newestTimeInMinutes >= 2520 and @startInterval != 60000 * 60 * 12 #half day
        @startInterval = 60000 * 60 * 12
        @restartTimer()

  timeAgoInWords: (timeString) ->
    absolutTime = @parse(timeString)
    @distanceOfTimeInWords(absolutTime) + " #{@options.suffix}"

  parse: (iso8601) ->
    timeStr = $.trim(iso8601)
    timeStr = timeStr.replace(/\.\d\d\d+/,"")
    timeStr = timeStr.replace(/-/,"/").replace(/-/,"/")
    timeStr = timeStr.replace(/T/," ").replace(/Z/," UTC")
    timeStr = timeStr.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2")
    new Date(timeStr);

  getTimeDistanceInMinutes: (absolutTime) ->
    timeDistance = new Date().getTime() - absolutTime.getTime()
    Math.round((Math.abs(timeDistance) / 1000) / 60)

  distanceOfTimeInWords: (absolutTime) ->
    #TODO support i18n.
    dim = @getTimeDistanceInMinutes(absolutTime) #distance in minutes

    if dim == 0
      "less than a minute"
    else if dim == 1
      "1 minute"
    else if dim >= 2 and dim <= 44
      "#{ dim } minutes"
    else if dim >= 45 and dim <= 89
      "about 1 hour"
    else if dim >= 90 and dim <= 1439
      "about #{ Math.round(dim / 60) } hours"
    else if dim >= 1440 and dim <= 2519
      "1 day"
    else if dim >= 2520 and dim <= 43199
      "#{ Math.round(dim / 1440) } days"
    else if dim >= 43200 and dim <= 86399
      "about 1 month"
    else if dim >= 86400 and dim <= 525599 #1 yr
      "#{ Math.round(dim / 43200) } months"
    else if dim >= 525600 and dim <= 655199 #1 yr, 3 months
      "about 1 year"
    else if dim >= 655200 and dim <= 914399 #1 yr, 9 months
      "over 1 year"
    else if dim >= 914400 and dim <= 1051199 #2 yr minus half minute
      "almost 2 years"
    else
      "about #{ Math.round(dim / 525600) } years"

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
