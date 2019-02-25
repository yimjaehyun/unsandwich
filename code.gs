function myFunction() {
  var max = 500;
  var offset = 0;
  var searchThreads = [];

  // Gets all the threads matching query
  /*
  while (true) {
    var threads = GmailApp.search("in:anywhere unsubscribe", offset, max);
    searchThreads = searchThreads.concat(threads);
    if (searchThreads.length < max) {
      break;
    }

    offset += max;
  }
  */

  // For testing
  searchThreads = GmailApp.search("in:anywhere unsubscribe", 0, 100);

  var allUrls = [];
  var allCompanyNames = [];

  //var doc = DocumentApp.openByUrl('https://docs.google.com/document/d/1GItIJQDoEwgBMSHnKdkjEu7sFfHHnwNQ5ULpDXthYjA/edit');
  //var body = doc.getBody();

  for (var t in searchThreads)  {

    var message = searchThreads[t].getMessages()[0];
    var companyName = message.getFrom().replace(/<(.*)/g, "").replace(/"|"/g, "");
    var raw = message.getRawContent();
    var urls = raw.match(/^list\-unsubscribe:(.|\r\n\s)+<(https?:\/\/[^>]+)>/im);

    if (urls) {
      urls = urls[2];
      // Only add if not in both arrays
      if (allUrls.indexOf(urls) < 0 && allCompanyNames.indexOf(companyName) < 0) {
        allUrls.push(urls);
        allCompanyNames.push(companyName);
      }
    }
  }


  // Send email with list of subscriptions and unsubscribe links
  var emailBody = '';
  if (allUrls.length <= 0 || allCompanyNames.length <= 0)
    emailBody = '<div>You have no subscriptions :)</div>';
  else {
    allUrls.forEach(function(url, i) {
      emailBody += '<div> ' + allCompanyNames[i] + ' <a href=\"' + url + '\">unsubscribe</a></div>';
    });
  }

  var me = Session.getActiveUser().getEmail();
  GmailApp.sendEmail(me, 'unsandwich', '', {
    htmlBody: emailBody
  });


  // For Testing
  //body.appendParagraph(allUrls);
  //body.appendParagraph(allCompanyNames);
  Logger.log(allUrls.length);
  Logger.log(allCompanyNames.length);
}
