describe("TimeAgo", function(){
  beforeEach(function(){
    TimeAgo = $.fn.timeago.Constructor
    timeAgo = new TimeAgo("time.timeago", {})
  });

  describe("constructor", function(){
    it("should contain the startInterval", function(){
      expect(timeAgo.startInterval).toEqual(30000);
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

    describe("context: newestTimeInMinutes < 44.5 and @startInterval != 30000", function(){
      beforeEach(function(){
        timeAgo.startInterval = 60000 * 15
      });

      it("should update interval to 30000", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(44);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual(30000);
      });

      it("should call restartTimer", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(44);
        spyOn(timeAgo, 'restartTimer');
        timeAgo.updateInterval();
        expect(timeAgo.restartTimer).toHaveBeenCalled();
      });
    });


    describe("context: newestTimeInMinutes >= 44.5 and newestTimeInMinutes < 89.5 and @startInterval != 60000 * 15", function(){
      beforeEach(function(){
        timeAgo.startInterval = 30000;
      });

      it("should update interval to 900000", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(50);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual(900000);
      });

      it("should call restartTimer", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(50);
        spyOn(timeAgo, 'restartTimer');
        timeAgo.updateInterval();
        expect(timeAgo.restartTimer).toHaveBeenCalled();
      });
    });

    describe("context: newestTimeInMinutes >= 89.5 and newestTimeInMinutes < 1439.5 and @startInterval != 60000 * 30", function(){
      beforeEach(function(){
        timeAgo.startInterval = 900000;
      });

      it("should update interval to 1800000", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(500);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual(1800000);
      });

      it("should call restartTimer", function(){
        spyOn(timeAgo, 'getTimeDistanceInMinutes').andReturn(500);
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
    describe("context: dim >= 0 and dim < 0.5", function(){
      it("should return 'less than a minute'", function(){
        expect(timeAgo.distanceOfTimeInWords(0.1)).toEqual("less than a minute");
      });
    });

    describe("context:  dim >= 0.5 and dim < 1.5", function(){
      it("should return '1 minute'", function(){
        expect(timeAgo.distanceOfTimeInWords(0.6)).toEqual("1 minute");
      });
    });

    describe("context: dim >= 1.5 and dim < 44.5", function(){
      it("should return '40 minutes'", function(){
        expect(timeAgo.distanceOfTimeInWords(40)).toEqual("40 minutes");
      });
    });

    describe("context:  dim >= 44.5 and dim < 89.5", function(){
      it("should return 'about 1 hour'", function(){
        expect(timeAgo.distanceOfTimeInWords(80)).toEqual("about 1 hour");
      });
    });

    describe("context: dim >= 89.5 and dim < 1439.5", function(){
      it("should return 'about 2 hours'", function(){
        expect(timeAgo.distanceOfTimeInWords(120)).toEqual("about 2 hours");
      });
    });

    describe("context: dim >= 1439.5 and dim < 2519.5", function(){
      it("should return '1 day'", function(){
        expect(timeAgo.distanceOfTimeInWords(1500)).toEqual("1 day");
      });
    });

    describe("context: dim >= 2519.5 and dim < 43199.5", function(){
      it("should return '3 days'", function(){
        expect(timeAgo.distanceOfTimeInWords(4321)).toEqual("3 days");
      });
    });

    describe("context: dim >= 43199.5 and dim < 86399.5", function(){
      it("should return 'about 1 month'", function(){
        expect(timeAgo.distanceOfTimeInWords(50000)).toEqual("about 1 month");
      });
    });

    describe("context:dim >= 86399.5 and dim < 525599.5", function(){
      it("should return '2 months'", function(){
        expect(timeAgo.distanceOfTimeInWords(86400)).toEqual("2 months");
      });
    });

    describe("context: dim >= 525599.5 and dim < 655199.5", function(){
      it("should return 'about 1 year'", function(){
        expect(timeAgo.distanceOfTimeInWords(535500)).toEqual("about 1 year");
      });
    });

    describe("context:dim >= 655199.5 and dim < 914399.5", function(){
      it("should return 'over 1 year'", function(){
        expect(timeAgo.distanceOfTimeInWords(665199)).toEqual("over 1 year");
      });
    });

    describe("context:dim >= 914399.5 and dim < 1051199.5", function(){
      it("should return 'almost 2 years'", function(){
        expect(timeAgo.distanceOfTimeInWords(1051199)).toEqual("almost 2 years");
      });
    });

    describe("context: else", function(){
      it("should return 'about 3 years'", function(){
        expect(timeAgo.distanceOfTimeInWords(1576800)).toEqual("about 3 years");
      });
    });

  });

});
