function getFbEvents(params){
  return new Promise(function(resolve) {
    var apiUrl = '/' + window.fbPageId + '/events?';
    var locationString = 'place{name, location{' + [
      'city', 'country', 'latitude', 'located_in', 'longitude', 'name', 'region', 'state', 'street', 'zip'
    ].join(',') + '}}';
    var fieldsString = '&fields=' + [
      'id', 'name', 'description', 'start_time', 'end_time', 'cover{source}', locationString
    ].join(',');

    FB.api([
      apiUrl,
      window.accessTokenParam,
      fieldsString
    ].join(''), resolve);
  });
}

function fbEventResponseHandler(response){
  var fbEvents;
  if (response && !response.error) {
    fbEvents = response.data;
  } else {
    console.log('Error fetching Facebook events')
  }

  return Promise.resolve(fbEvents || []);
}


function listEventItem(fbEvent){
  var timeFormat = 'h:mma';
  var eventStartTime = moment(fbEvent.start_time);
  var eventEndTime = fbEvent.end_time && moment(fbEvent.end_time);
  var now = Date.now();
  var startTimeDiff = eventStartTime && eventStartTime - now;
  var endTimeDiff = eventEndTime && eventEndTime - now;
  var startDateString = eventStartTime.format('dddd, MMMM Do');
  var startTimeString = eventStartTime.format(timeFormat);
  var endTimeString = eventEndTime ? eventEndTime.format(timeFormat) : '???';
  var fullDateString = startDateString + ', ' + startTimeString + ' to ' + endTimeString;
  var isOld = false;

  if(eventEndTime != null){
    isOld = endTimeDiff < 0;
  } else if (eventStartTime != null) {
    isOld = startTimeDiff < 0;
  }

  var liCss = 'card-panel hoverable z-depth-1';
  if (isOld) {
    liCss += ' old-event-cover';
  }

  var locationHtml;
  var fbEventPlace = fbEvent.place;
  if (fbEventPlace) {
    var fbEventLocation = fbEventPlace.location;
    var fullAddrString = fbEventLocation && fbEventLocation.street + ', ' + fbEventLocation.city + ', ' + fbEventLocation.state + ' ' + fbEventLocation.zip;
    locationHtml = [
      "<h6 class='event-icon-wrapper'>",
      "  <i class='small material-icons'>location_on</i>",
      "  <span class='event-icon-details'>",
      "    <div>", fbEventPlace.name,"</div>",
      "    <span>", fullAddrString, "</span>",
      "  </span>",
      "</h6>"
    ].join('');
  } else {
    locationHtml = '';
  }

  return [
    "<li class='", liCss, "'>",
    "  <a class='row black-text' target='_blank' href=https://www.facebook.com/events/", fbEvent.id,">",
    "    <div class='col s5'>",
    "      <img src=", fbEvent.cover.source, " alt='' class='responsive-img'>",
    "    </div>",
    "    <div class='col s7 event-details'>",
    "      <h4 class='event-title'>", fbEvent.name, "</h4>",
    "      <div>",
    "        <h6 class='event-icon-wrapper'>",
    "          <i class='small material-icons'>date_range</i>",
    "          <span class='event-icon-details'>", fullDateString, "</span>",
    "        </h6>", locationHtml,
    "      </div>",
    "      <span class='black-text flow-text'>", fbEvent.description,"</span>",
    "    </div>",
    "  </a>",
    "</li>"
  ].join('');
}

function initPage(fbEvents){
  var photoList = $('#event-list');

  fbEvents.forEach(function(p){
    photoList.append(listEventItem(p));
  });

  Materialize.showStaggeredList('.staggered_list');
}

window.runPageJs = function(fbAppId, fbToken, fbPageId) {
  window.initFbApi(fbAppId, fbToken, fbPageId).then(getFbEvents).then(fbEventResponseHandler).then(initPage);
}