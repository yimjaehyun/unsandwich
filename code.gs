function myFunction() {
  var max = 500;
  var offset = 0;
  var searchThreads = [];

  // Create 'unsandwich' label
  var label = GmailApp.getUserLabelByName("unsandwich");
  if (!label) {
    GmailApp.createLabel("unsandwich");
    label = GmailApp.getUserLabelByName("unsandwich");
  }

  // Gets all the threads matching query
  while (true) {
    var threads = GmailApp.search("newer_than:30d {category:updates category:social category:forums category:promotions} unsubscribe NOT label:unsandwich ", offset, max);
    searchThreads = searchThreads.concat(threads);
    if (threads.length < max) {
      break;
    }

    offset += max;
  }

  // For testing
  // searchThreads = GmailApp.search("newer_than:30d {category:updates category:social category:forums category:promotions} unsubscribe AND NOT label:unsandwich", offset, max);

  var allUrls = [];
  var allCompanyNames = [];
  var allMailTo = [];
  var allCompanyNames2 = [];

  /*
  var doc = DocumentApp.openByUrl('https://docs.google.com/document/d/1GItIJQDoEwgBMSHnKdkjEu7sFfHHnwNQ5ULpDXthYjA/edit');
  var body = doc.getBody();
  */

  for (var t in searchThreads)  {
    label.addToThread(searchThreads[t]);
    var message = searchThreads[t].getMessages()[0];
    var companyName = message.getFrom().replace(/<(.*)/g, "").replace(/"|"/g, "");

    if (allCompanyNames.indexOf(companyName) > 0 || allCompanyNames2.indexOf(companyName) > 0) {
      continue;
    }

    Logger.log(companyName);

    var raw = message.getRawContent();
    var urls = raw.match(/^list\-unsubscribe:(.|\r\n\s)+<(https?:\/\/[^>]+)>/im);

    if (urls) {
      urls = urls[2];
      if (allUrls.indexOf(urls) < 0 && allCompanyNames.indexOf(companyName) < 0) {
        allUrls.push(urls);
        allCompanyNames.push(companyName);
      }
    } else {
      var body = message.getBody().replace(/\s/g, "");
      var hrefs = new RegExp(/<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>(.*?)<\/a>/gi);
      var found = false;
      while ( urls = hrefs.exec(body) ) {
        if (urls[1].match(/unsubscribe|optout|opt\-out|remove/i)
            || urls[2].match(/unsubscribe|optout|opt\-out|remove/i)) {
          if (allUrls.indexOf(urls) < 0 && allCompanyNames.indexOf(companyName) < 0) {
            allUrls.push(urls[1]);
            allCompanyNames.push(companyName);
          }
          found = true;
        }
      }

      if (!found) {
        urls = raw.match(/^list\-unsubscribe:(.|\r\n\s)+<mailto:([^>]+)>/im);
        if (urls) {
          urls = urls[2];
          if (allMailTo.indexOf(urls) < 0 && allCompanyNames2.indexOf(companyName) < 0) {
            allMailTo.push(urls);
            allCompanyNames2.push(companyName);
          }
        }
      }
    }
  }


  // Send email with list of subscriptions and unsubscribe links
  var emailBody = '';
  if (allUrls.length <= 0 && allCompanyNames.length <= 0 && allMailTo.length <= 0)
    emailBody = '<div>You have no subscriptions :)</div>';
  else {
    allUrls.forEach(function(url, i) {
      emailBody += '<div> ' + allCompanyNames[i] + ' <a href=\"' + url + '\">unsubscribe</a></div>';
    });
    allMailTo.forEach(function(url, i) {
      emailBody += '<div> ' + allCompanyNames2[i] + url + '</div>';
    });
  }

  var me = Session.getActiveUser().getEmail();
  GmailApp.sendEmail(me, 'unsandwich', '', {
    htmlBody: emailBody
  });

  // For Testing
  //body.appendParagraph(allUrls);
  //body.appendParagraph(allCompanyNames);
  Logger.log("allUrls: " + allUrls.length);
  Logger.log("allCompanyNames: " + allCompanyNames.length);
  Logger.log("allMailTo: " + allMailTo.length);
}
