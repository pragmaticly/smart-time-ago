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

  describe("#startTimer", function(){
    it("should call setInterval", function(){
      spyOn(window, 'setTimeout');
      timeAgo.startTimer();
      expect(window.setTimeout).toHaveBeenCalled();
    });

    it("should set interval", function(){
      spyOn(window, 'setTimeout').andReturn("spy");
      timeAgo.startTimer();
      expect(timeAgo.interval).toEqual("spy");
    });
  });

  describe("#stopTimer",function(){
    it("should call clearInterval", function(){
      spyOn(window, 'clearTimeout');
      timeAgo.stopTimer();
      expect(window.clearTimeout).toHaveBeenCalled();
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
      timeAgo = new TimeAgo("time.timeago", { attr: 'datetime', suffix: 'ago'});
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
      timeAgo = new TimeAgo("time.timeago", { attr: 'datetime', suffix: 'ago'});
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

      it("should update interval to (5400 - dis) * 1000", function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(2760);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual((5400 - 2760) * 1000);
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

      it("should update interval to (86400 - dis % 86400) * 1000", function(){
        spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(151200);
        timeAgo.updateInterval();
        expect(timeAgo.startInterval).toEqual((86400 - 151200 % 86400) * 1000);
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

    describe("context: dis == 0", function(){
      it("should return 'less than a minute'", function(){
        expect(timeAgo.distanceOfTimeInWords(0)).toEqual("less than a minute");
      });
    });

    describe("context: dis == 60", function(){
      it("should return '1 minute'", function(){
        expect(timeAgo.distanceOfTimeInWords(60)).toEqual("1 minute");
      });
    });

    describe("context: dis >= 120 and dim < 2700", function(){
      it("should return '2 minutes'", function(){
        expect(timeAgo.distanceOfTimeInWords(120)).toEqual("2 minutes");
      });
    });

    describe("context: dis >= 2700 and dim < 5400", function(){
      it("should return 'about 1 hour'", function(){
        expect(timeAgo.distanceOfTimeInWords(5300)).toEqual("about 1 hour");
      });
    });

    describe("context: dis >= 5400 and dim < 86400", function(){
      it("should return 'about 2 hours'", function(){
        expect(timeAgo.distanceOfTimeInWords(7200)).toEqual("about 2 hours");
      });
    });

    describe("context: dis >= 86400 and dim < 151200", function(){
      it("should return '1 day'", function(){
        expect(timeAgo.distanceOfTimeInWords(151100)).toEqual("1 day");
      });
    });

    describe("context: dis >= 151200 and dim < 2592000", function(){
      it("should return '2 days'", function(){
        expect(timeAgo.distanceOfTimeInWords(151200)).toEqual("2 days");
      });
    });

    describe("context: dis >= 2592000 and dim < 5184000", function(){
      it("should return 'about 1 month'", function(){
        expect(timeAgo.distanceOfTimeInWords(5183000)).toEqual("about 1 month");
      });
    });

    describe("context: dis >= 5184000 and dim < 31536000", function(){
      it("should return '12 months'", function(){
        expect(timeAgo.distanceOfTimeInWords(31535940)).toEqual("12 months");
      });
    });

    describe("context: dis >= 31536000 and dim < 39312000", function(){
      it("should return 'about 1 year'", function(){
        expect(timeAgo.distanceOfTimeInWords(31536000)).toEqual("about 1 year");
      });
    });

    describe("context: dis >= 39312000 and dim < 54864000", function(){
      it("should return 'over 1 year'", function(){
        expect(timeAgo.distanceOfTimeInWords(39312000)).toEqual("over 1 year");
      });
    });

    describe("context: dis >= 54864000 and dim < 63072000", function(){
      it("should return 'almost 2 years'", function(){
        expect(timeAgo.distanceOfTimeInWords(54864000)).toEqual("almost 2 years");
      });
    });

    describe("context: dis >= 63072000", function(){
      it("should return 'about 2 years'", function(){
        expect(timeAgo.distanceOfTimeInWords(63072000)).toEqual("about 2 years");
      });
    });

  });

  describe("options", function(){
    describe("spacing == false", function(){
      beforeEach(function(){
        timeAgo.options.spacing = false;
      });
      it("should return '1minute'", function() {
        expect(timeAgo.distanceOfTimeInWords(60)).toEqual("1minute");
      });
      afterEach(function(){
        timeAgo.options.spacing = true;
      });
    });

    describe("approximate == false", function(){
      beforeEach(function(){
        timeAgo.options.approximate = false;
      });

      describe("context: dis == 0", function(){
        it("should return '1 minute'", function(){
          expect(timeAgo.distanceOfTimeInWords(0)).toEqual("1 minute");
        });
      });

      describe("context: dis == 60", function(){
        it("should return '1 minute'", function(){
          expect(timeAgo.distanceOfTimeInWords(60)).toEqual("1 minute");
        });
      });

      describe("context: dis >= 120 and dim < 2700", function(){
        it("should return '2 minutes'", function(){
          expect(timeAgo.distanceOfTimeInWords(120)).toEqual("2 minutes");
        });
      });

      describe("context: dis >= 2700 and dim < 5400", function(){
        it("should return '1 hour'", function(){
          expect(timeAgo.distanceOfTimeInWords(5300)).toEqual("1 hour");
        });
      });

      describe("context: dis >= 5400 and dim < 86400", function(){
        it("should return '2 hours'", function(){
          expect(timeAgo.distanceOfTimeInWords(7200)).toEqual("2 hours");
        });
      });

      describe("context: dis >= 86400 and dim < 151200", function(){
        it("should return '1 day'", function(){
          expect(timeAgo.distanceOfTimeInWords(151100)).toEqual("1 day");
        });
      });

      describe("context: dis >= 151200 and dim < 2592000", function(){
        it("should return '2 days'", function(){
          expect(timeAgo.distanceOfTimeInWords(151200)).toEqual("2 days");
        });
      });

      describe("context: dis >= 2592000 and dim < 5184000", function(){
        it("should return '1 month'", function(){
          expect(timeAgo.distanceOfTimeInWords(5183000)).toEqual("1 month");
        });
      });

      describe("context: dis >= 5184000 and dim < 31536000", function(){
        it("should return '12 months'", function(){
          expect(timeAgo.distanceOfTimeInWords(31535940)).toEqual("12 months");
        });
      });

      describe("context: dis >= 31536000 and dim < 39312000", function(){
        it("should return '1 year'", function(){
          expect(timeAgo.distanceOfTimeInWords(31536000)).toEqual("1 year");
        });
      });

      describe("context: dis >= 39312000 and dim < 54864000", function(){
        it("should return '1 year'", function(){
          expect(timeAgo.distanceOfTimeInWords(39312000)).toEqual("1 year");
        });
      });

      describe("context: dis >= 54864000 and dim < 63072000", function(){
        it("should return '2 years'", function(){
          expect(timeAgo.distanceOfTimeInWords(54864000)).toEqual("2 years");
        });
      });

      describe("context: dis >= 63072000", function(){
        it("should return '2 years'", function(){
          expect(timeAgo.distanceOfTimeInWords(63072000)).toEqual("2 years");
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

      describe("context: dis >= 63072000", function(){
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

    describe("showSeconds == true", function(){
      beforeEach(function(){
        timeAgo.options.showSeconds = true;
      });

      describe("context: dis == 0", function(){
        it("should return '1 second'", function(){
          expect(timeAgo.distanceOfTimeInWords(0)).toEqual("1 second");
        });
      });

      describe("context: dis == 1", function(){
        it("should return '1 second'", function(){
          expect(timeAgo.distanceOfTimeInWords(1)).toEqual("1 second");
        });
      });

      describe("context: dis == 30", function(){
        it("should return '30 seconds'", function(){
          expect(timeAgo.distanceOfTimeInWords(30)).toEqual("30 seconds");
        });
      });

      afterEach(function(){
        timeAgo.options.showSeconds = false;
      });
    });

    describe("showSeconds == true and showNow == 5", function(){
      beforeEach(function(){
        timeAgo.options.showSeconds = true;
        timeAgo.options.showNow = 15;
      });

      describe("context: dis == 5", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(5);
        });
        it("should return 'just now'", function(){
          expect(timeAgo.timeAgoInWords(new Date().toString())).toEqual("just now");
        });
      });

      describe("context: dis == 20", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(20);
        });
        it("should return '20 seconds ago'", function(){
          expect(timeAgo.timeAgoInWords(new Date().toString())).toEqual("20 seconds ago");
        });
      });

      afterEach(function(){
        timeAgo.options.showSeconds = false;
        timeAgo.options.showNow = false;
      });
    });

    describe("maxRelative == 2592000", function(){
      beforeEach(function(){
        timeAgo.options.maxRelative = 2592000;
      });

      describe("context: dis == 5", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(5);
        });
        it("should return 'less than a minute ago'", function(){
          expect(timeAgo.timeAgoInWords(new Date().toString())).toEqual("less than a minute ago");
        });
      });

      describe("context: dis == 2600000", function(){
        beforeEach(function(){
          spyOn(timeAgo, 'getTimeDistanceInSeconds').andReturn(2600000);
        });
        var datetime = '2012-07-18T07:51:50Z';
        it("should return '" + datetime + "'", function(){
          expect(timeAgo.timeAgoInWords(datetime)).toEqual(datetime);
        });
      });

      afterEach(function(){
        timeAgo.options.maxRelative = false;
      });
    });

  });

});
