# Smart Time Ago v0.0.1

# Copyright 2012, Terry Tai, Pragmatic.ly
# https://pragmatic.ly/
# Licensed under the MIT license.
# https://github.com/pragmaticly/smart-time-ago/blob/master/LICENSE

class TimeAgo
  constructor: (element, options) ->
    @startInterval = 30000
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
      if newestTimeInMinutes < 44.5 and @startInterval != 30000
        @startInterval = 30000
        @restartTimer()
      else if newestTimeInMinutes >= 44.5 and newestTimeInMinutes < 89.5 and @startInterval != 60000 * 15
        @startInterval = 60000 * 15
        @restartTimer()
      else if newestTimeInMinutes >= 89.5 and newestTimeInMinutes < 1439.5 and @startInterval != 60000 * 30
        @startInterval = 60000 * 30
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
    (Math.abs(timeDistance) / 1000) / 60

  distanceOfTimeInWords: (dim) ->
    # Wrods need to be the same with Rails
    # 0 <-> 29 secs                                                             # => less than a minute
    # 30 secs <-> 1 min, 29 secs                                                # => 1 minute
    # 1 min, 30 secs <-> 44 mins, 29 secs                                       # => [2..44] minutes
    # 44 mins, 30 secs <-> 89 mins, 29 secs                                     # => about 1 hour
    # 89 mins, 30 secs <-> 23 hrs, 59 mins, 29 secs                             # => about [2..24] hours
    # 23 hrs, 59 mins, 30 secs <-> 41 hrs, 59 mins, 29 secs                     # => 1 day
    # 41 hrs, 59 mins, 30 secs  <-> 29 days, 23 hrs, 59 mins, 29 secs           # => [2..29] days
    # 29 days, 23 hrs, 59 mins, 30 secs <-> 59 days, 23 hrs, 59 mins, 29 secs   # => about 1 month
    # 59 days, 23 hrs, 59 mins, 30 secs <-> 1 yr minus 1 sec                    # => [2..12] months
    # 1 yr <-> 1 yr, 3 months                                                   # => about 1 year
    # 1 yr, 3 months <-> 1 yr, 9 months                                         # => over 1 year
    # 1 yr, 9 months <-> 2 yr minus 1 sec                                       # => almost 2 years
    # 2 yrs <-> max time or date                                                # => (same rules as 1 yr)

    if dim >= 0 and dim < 0.5
      "less than a minute"
    else if dim >= 0.5 and dim < 1.5
      "1 minute"
    else if dim >= 1.5 and dim < 44.5
      "#{ Math.round(dim) } minutes"
    else if dim >= 44.5 and dim < 89.5
      "about 1 hour"
    else if dim >= 89.5 and dim < 1439.5 #23 hrs, 59 mins, 29 secs
      "about #{ Math.round(dim / 60) } hours"
    else if dim >= 1439.5 and dim < 2519.5 #41 hrs, 59 mins, 29 secs
      "1 day"
    else if dim >= 2519.5 and dim < 43199.5 #29 days, 23 hrs, 59 mins, 29 secs
      "#{ Math.round(dim / 1440) } days"
    else if dim >= 43199.5 and dim < 86399.5 #59 days, 23 hrs, 59 mins, 29 secs
      "about 1 month"
    else if dim >= 86399.5 and dim < 525599.5 #1 yr minus half minute
      "#{ Math.round(dim / 43200) } months"
    else if dim >= 525599.5 and dim < 655199.5 #1 yr, 3 months
      "about 1 year"
    else if dim >= 655199.5 and dim < 914399.5 #1 yr, 9 months
      "over 1 year"
    else if dim >= 914399.5 and dim < 1051199.5 #2 yr minus half minute
      "almost 2 years"
    else
      "about #{Math.round(dim / 525600)} years"

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
