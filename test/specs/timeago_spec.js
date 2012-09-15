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


    describe("context: newestTimeInSeconds >= 0 and newestTimeInSeconds < 2700 and @startInterval != 60000", function(){
      beforeEach(function(){
        timeAgo.startInterval = 60000 * 22;
      });

      it("should update interval to 60000", function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(120);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual(60000);
      });

      it("should call restartTimer", function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(120);
        spyOn(timeAgo, 'restartTimer');
        timeAgo.updateInterval();
        expect(timeAgo.restartTimer).toHaveBeenCalled();
      });
    });

    describe("context: newestTimeInSeconds >= 2700 and newestTimeInSeconds < 5400 and @startInterval != 60000 * 30", function(){
      beforeEach(function(){
        timeAgo.startInterval = 60000;
      });

      it("should update interval to 1320000", function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(2760);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual(1320000);
      });

      it("should call restartTimer", function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(2760);
        spyOn(timeAgo, 'restartTimer');
        timeAgo.updateInterval();
        expect(timeAgo.restartTimer).toHaveBeenCalled();
      });
    });

    describe("context: newestTimeInSeconds >= 5400 and newestTimeInSeconds < 151200 and @startInterval != 60000 * 60", function(){
      beforeEach(function(){
        timeAgo.startInterval = 1320000;
      });

      it("should update interval to 1800000", function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(5400);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual(1800000);
      });

      it("should call restartTimer", function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(151100);
        spyOn(timeAgo, 'restartTimer');
        timeAgo.updateInterval();
        expect(timeAgo.restartTimer).toHaveBeenCalled();
      });
    });

    describe("context: newestTimeInSeconds >= 151200 and @startInterval != 60000 * 60 * 24", function(){
      beforeEach(function(){
        timeAgo.startInterval = 1800000;
      });

      it("should update interval to 43200000", function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(151200);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual(43200000);
      });

      it("should call restartTimer", function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(6000000000);
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
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(0);
      });
      it("should return 'less than a minute'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("less than a minute");
      });
    });

    describe("context: dim == 60", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(60);
      });
      it("should return '1 minute'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("1 minute");
      });
    });

    describe("context: dim >= 120 and dim < 2700", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(120);
      });
      it("should return '2 minutes'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("2 minutes");
      });
    });

    describe("context: dim >= 2700 and dim < 5400", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(5300);
      });
      it("should return 'about 1 hour'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("about 1 hour");
      });
    });

    describe("context: dim >= 5400 and dim < 86400", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(7200);
      });
      it("should return 'about 2 hours'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("about 2 hours");
      });
    });

    describe("context: dim >= 86400 and dim < 151200", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(151100);
      });
      it("should return '1 day'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("1 day");
      });
    });

    describe("context: dim >= 151200 and dim < 2592000", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(151200);
      });
      it("should return '2 days'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("2 days");
      });
    });

    describe("context: dim >= 2592000 and dim < 5184000", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(5183000);
      });
      it("should return 'about 1 month'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("about 1 month");
      });
    });

    describe("context: dim >= 5184000 and dim < 31536000", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(31535940);
      });
      it("should return '12 months'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("12 months");
      });
    });

    describe("context: dim >= 31536000 and dim < 39312000", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(31536000);
      });
      it("should return 'about 1 year'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("about 1 year");
      });
    });

    describe("context: dim >= 39312000 and dim < 54864000", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(39312000);
      });
      it("should return 'over 1 year'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("over 1 year");
      });
    });

    describe("context: dim >= 54864000 and dim < 63072000", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(54864000);
      });
      it("should return 'almost 2 years'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("almost 2 years");
      });
    });

    describe("context: >= 63072000", function(){
      beforeEach(function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(63072000);
      });
      it("should return 'about 2 years'", function(){
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("about 2 years");
      });
    });

  });

  describe("options", function(){
    describe("spacing == false", function(){
      beforeEach(function(){
        timeAgo.options.spacing = false;
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(60);
      });
      it("should return '1minute'", function() {
        expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("1minute");
      });
      afterEach(function(){
        timeAgo.options.spacing = true;
      });
    });

    describe("approximate == false", function(){
      beforeEach(function(){
        timeAgo.options.approximate = false;
      });

      describe("context: dim == 0", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(0);
        });
        it("should return '1 minute'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("1 minute");
        });
      });

      describe("context: dim == 60", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(60);
        });
        it("should return '1 minute'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("1 minute");
        });
      });

      describe("context: dim >= 120 and dim < 2700", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(120);
        });
        it("should return '2 minutes'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("2 minutes");
        });
      });

      describe("context: dim >= 2700 and dim < 5400", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(5300);
        });
        it("should return '1 hour'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("1 hour");
        });
      });

      describe("context: dim >= 5400 and dim < 86400", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(7200);
        });
        it("should return '2 hours'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("2 hours");
        });
      });

      describe("context: dim >= 86400 and dim < 151200", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(151100);
        });
        it("should return '1 day'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("1 day");
        });
      });

      describe("context: dim >= 151200 and dim < 2592000", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(151200);
        });
        it("should return '2 days'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("2 days");
        });
      });

      describe("context: dim >= 2592000 and dim < 5184000", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(5183000);
        });
        it("should return '1 month'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("1 month");
        });
      });

      describe("context: dim >= 5184000 and dim < 31536000", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(31535940);
        });
        it("should return '12 months'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("12 months");
        });
      });

      describe("context: dim >= 31536000 and dim < 39312000", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(31536000);
        });
        it("should return '1 year'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("1 year");
        });
      });

      describe("context: dim >= 39312000 and dim < 54864000", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(39312000);
        });
        it("should return '1 year'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("1 year");
        });
      });

      describe("context: dim >= 54864000 and dim < 63072000", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(54864000);
        });
        it("should return '2 years'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("2 years");
        });
      });

      describe("context: >= 63072000", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(63072000);
        });
        it("should return '2 years'", function(){
          expect(timeAgo.distanceOfTimeInWords(new Date())).toEqual("2 years");
        });
      });

      afterEach(function(){
        timeAgo.options.approximate = true;
      });
    });

    describe("suffix == ' from now'", function(){
      beforeEach(function(){
        timeAgo.options.suffix = ' from now';
      });

      describe("context: >= 63072000", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(63072000);
        });
        it("should return 'about 2 years from now'", function(){
          expect(timeAgo.timeAgoInWords(new Date().toString())).toEqual("about 2 years from now");
        });
      });

      afterEach(function(){
        timeAgo.options.suffix = ' ago';
      });
    });

  });

});
