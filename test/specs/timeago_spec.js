// Smart Time Ago v0.0.2

// Copyright 2012, Terry Tai, Pragmatic.ly
// https://pragmatic.ly/
// Licensed under the MIT license.
// https://github.com/pragmaticly/smart-time-ago/blob/master/LICENSE

describe("TimeAgo", function(){
  beforeEach(function(){
    TimeAgo = $.fn.timeago.Constructor
    timeAgo = new TimeAgo("time.timeago", {})
  });

  describe("constructor", function(){
    it("should contain the startInterval", function(){
      expect(timeAgo.startInterval).toEqual(60000);
    });
  });

  describe("#init", function(){
    it("should set $element", function(){
      timeAgo.init("time.timeago", {});
      expect(timeAgo.$element).toEqual($("time.timeago"));
    });

    it("should load the options", function(){
      spyOn($, 'extend').andReturn("spy");
      timeAgo.init("time.timeago", {});
      expect(timeAgo.options).toEqual("spy");
    });

    it("should call updateTime", function(){
      spyOn(timeAgo, 'updateTime');
      timeAgo.init("time.timeago", {});
      expect(timeAgo.updateTime).toHaveBeenCalled();
    });

    it("should call startTimer", function(){
      spyOn(timeAgo, "startTimer");
      timeAgo.init("time.time", {});
      expect(timeAgo.startTimer).toHaveBeenCalled();
    });
  });

  describe("#startTimer", function(){
    it("should call setInterval", function(){
      spyOn(window, 'setInterval');
      timeAgo.startTimer();
      expect(window.setInterval).toHaveBeenCalled();
    });

    it("should set interval", function(){
      spyOn(window, 'setInterval').andReturn("spy");
      timeAgo.startTimer();
      expect(timeAgo.interval).toEqual("spy");
    });
  });

  describe("#stopTimer",function(){
    it("should call clearInterval", function(){
      spyOn(window, 'clearInterval');
      timeAgo.stopTimer();
      expect(window.clearInterval).toHaveBeenCalled();
    });
  });

  describe("#restartTimer", function(){
    it("should call stopTimer", function(){
      spyOn(timeAgo, 'stopTimer');
      timeAgo.restartTimer();
      expect(timeAgo.stopTimer).toHaveBeenCalled();
    });

    it("should call startTimer", function(){
      spyOn(timeAgo, 'startTimer');
      timeAgo.restartTimer();
      expect(timeAgo.startTimer).toHaveBeenCalled();
    });
  });

  describe("#updateTime", function(){
    beforeEach(function(){
      timeLabel = $('<time class="timeago" datetime="2012-07-18T07:51:50Z">about 8 hours ago</time>')
      $('body').append(timeLabel)
      timeAgo = new TimeAgo("time.timeago", {selector: 'time.timeago', attr: 'datetime', dir: 'up', suffix: 'ago'});
    });

    afterEach(function(){
      timeLabel.remove()
    });

    it("should update the relative time in html", function(){
      spyOn(timeAgo, 'timeAgoInWords').andReturn('about 9 hours ago')
      timeAgo.updateTime();
      expect($('time.timeago').first().html()).toEqual("about 9 hours ago")
    });
  });

  describe("#updateInterval", function(){
    beforeEach(function(){
      timeLabel = $('<time class="timeago" datetime="2012-07-18T07:51:50Z">about 8 hours ago</time>')
      $('body').append(timeLabel)
      timeAgo = new TimeAgo("time.timeago", {selector: 'time.timeago', attr: 'datetime', dir: 'up', suffix: 'ago'});
    });

    afterEach(function(){
      timeLabel.remove()
    });


    describe("context: newestTimeInMinutes >= 0 and newestTimeInMinutes <= 45 and @startInterval != 60000", function(){
      beforeEach(function(){
        timeAgo.startInterval = 60000 * 22;
      });

      it("should update interval to 60000", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(2);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual(60000);
      });

      it("should call restartTimer", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(2);
        spyOn(timeAgo, 'restartTimer');
        timeAgo.updateInterval();
        expect(timeAgo.restartTimer).toHaveBeenCalled();
      });
    });

    describe("context: newestTimeInMinutes >= 45 and newestTimeInMinutes <= 89 and @startInterval != 60000 * 30", function(){
      beforeEach(function(){
        timeAgo.startInterval = 60000;
      });

      it("should update interval to 1320000", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(46);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual(1320000);
      });

      it("should call restartTimer", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(46);
        spyOn(timeAgo, 'restartTimer');
        timeAgo.updateInterval();
        expect(timeAgo.restartTimer).toHaveBeenCalled();
      });
    });

    describe("context: newestTimeInMinutes >= 90 and newestTimeInMinutes <= 2519 and @startInterval != 60000 * 60", function(){
      beforeEach(function(){
        timeAgo.startInterval = 1320000;
      });

      it("should update interval to 1800000", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(90);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual(1800000);
      });

      it("should call restartTimer", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(2519);
        spyOn(timeAgo, 'restartTimer');
        timeAgo.updateInterval();
        expect(timeAgo.restartTimer).toHaveBeenCalled();
      });
    });

    describe("context: newestTimeInMinutes >= 2520 and @startInterval != 60000 * 60 * 24", function(){
      beforeEach(function(){
        timeAgo.startInterval = 1800000;
      });

      it("should update interval to 43200000", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(2520);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual(43200000);
      });

      it("should call restartTimer", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(100000000);
        spyOn(timeAgo, 'restartTimer');
        timeAgo.updateInterval();
        expect(timeAgo.restartTimer).toHaveBeenCalled();
      });
    });

  });


  describe("#parse", function(){
    beforeEach(function(){
      timeStr = "2012-07-18T07:51:50Z";
      result = timeAgo.parse(timeStr);
    });

    it("should get the right time", function(){
      expect(result.toUTCString()).toEqual("Wed, 18 Jul 2012 07:51:50 GMT");
    });
  });

  describe("distanceOfTimeInWords", function(){

    describe("context: dim == 0", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(0);
      });
      it("should return 'less than a minute'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("less than a minute");
      });
    });

    describe("context: dim == 1", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(1);
      });
      it("should return '1 minute'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("1 minute");
      });
    });

    describe("context: dim >= 2 and dim <= 44", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(2);
      });
      it("should return '2 minutes'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("2 minutes");
      });
    });

    describe("context: dim >= 45 and dim <= 89", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(89);
      });
      it("should return 'about 1 hour'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("about 1 hour");
      });
    });

    describe("context: dim >= 90 and dim <= 1439", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(120);
      });
      it("should return 'about 2 hours'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("about 2 hours");
      });
    });

    describe("context: dim >= 1440 and dim <= 2519", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(2519);
      });
      it("should return '1 day'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("1 day");
      });
    });

    describe("context: dim >= 2520 and dim <= 43199", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(2520);
      });
      it("should return '2 days'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("2 days");
      });
    });

    describe("context: dim >= 43200 and dim <= 86399", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(86399);
      });
      it("should return 'about 1 month'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("about 1 month");
      });
    });

    describe("context: dim >= 86400 and dim <= 525599", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(525599);
      });
      it("should return '12 months'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("12 months");
      });
    });

    describe("context: dim >= 525600 and dim <= 655199", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(525600);
      });
      it("should return 'about 1 year'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("about 1 year");
      });
    });

    describe("context: dim >= 655200 and dim <= 914399", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(655200);
      });
      it("should return 'over 1 year'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("over 1 year");
      });
    });

    describe("context: dim >= 914400 and dim <= 1051199", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(914400);
      });
      it("should return 'almost 2 years'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("almost 2 years");
      });
    });

    describe("context: >= 1051200", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(1051200);
      });
      it("should return 'almost 2 years'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("about 2 years");
      });
    });

  });

});
