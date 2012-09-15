Smart Time Ago
======================

Smart Time Ago is a little jQuery library to update the relative timestamps in your document intelligently. (e.g "3 hours ago").

It's originally built for https://pragmatic.ly/. 

It's inspired by another jQuery plugin http://timeago.yarp.com/ but give more flexibility and more intelligently.

Installation
------------

You can use it as a jQuery plugin. 

    Just copy the lib/timeago.js or src/timeago.coffee to your project folder then load it after jQuery.

Or if you use node, you can install it from npm.
  
    $ npm install -g smart-time-ago

Why Smart?
-------------

Smart Time Ago will check and update the relative time only when it needs to, automatically increasing the timeout time as the given date becomes older.

For example, if the newest time in the scope you specify is '2 hours ago'. There is no need to check and update the relative time every 60 seconds. Instead, Smart Time Ago will automaticly make the checking time timeout to the next time it needs to update.

Usage
------------

You can use it in a specify scope like.
   
    <div class="timeLables">
     <div class="timeago" datetime="2012-07-18T07:51:50Z">about 8 hours ago</div>
     <dic class="timeago" datetime="2012-07-18T06:51:50Z">about 9 hours ago</div>
    </div>
    
    $('.timeago').timeago();

By default, timeago will get the date from the `datetime` attribute. This will create a TimeAgo instance for each of the matched elements that have the required attribute.

Configuration
--------------

```js
$.fn.timeago.defaults = {
  // The default attribute to put the ISO8601 absolute time to parse.
  attr: 'datetime',

  // An extra space character will be added between the time and the unit.
  // '1 minute' will look like '1minute' with spacing set to `false`.
  spacing: true,

  // Will enable displaying text approximation words
  // such as 'about 1 hour' and 'almost 2 years'.
  approximate: true,

  // The text generated by Smart Time Ago will look like '3 hours ago'.
  // If you want the text looks like '3 hours from now',
  // you might need change the 'suffix' to ' from now'.
  suffix: ' ago',

  // Will show how many seconds. Instead of 'less than a minute ago' you'll see '24 seconds ago'.
  showSeconds: false,

  // You can specify how many seconds, below 59, to show a 'just now' message
  // instead of '1 second ago'.
  showNow: false,

  // After a date's relative time is too big,
  // you might want to display its absolute version.
  // For example, if after one month you don't want to display '2 years ago',
  // you can make `maxRelative` equal `2592000` which is a month in seconds.
  // Then specify an absolute displaying date function.
  maxRelative: false,
  absoluteDate: function(date, datetime) { return datetime; }
};
```


T

You can change the default configurations by passing the options to
timeago function when initialize timeago like:

    $('.timeago').timeago({selector: 'span.timeago', attr: 'title', dir: 'down', suffix: ' from now'})

TODO
-----
Will create a gem to better support Rails project.

Thanks very much if you could contribute.


Credits
-------

![pragmatic.ly](https://pragmatic.ly/assets/vlogo.png)

Smart Time Ago is maintained and funded by [Pragmatic.ly](https://pragmatic.ly/ "Pragmatic.ly").

Thanks to all the contributors.

Special thanks to [unRob](https://github.com/unRob) for the i18n support.

Copyright (c) 2012 Terry Tai, Pragmatic.ly (terry@pragmatic.ly, https://pragmatic.ly/)
