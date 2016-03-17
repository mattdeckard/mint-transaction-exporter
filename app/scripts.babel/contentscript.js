'use strict';

console.log('Mint transaction exporter extension running');

var lastJsonDataRequest = undefined;

function resendLastRequest() {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', lastJsonDataRequest.url);
    xhr.onload = (xhrEvent => resolve(JSON.parse(xhrEvent.target.response)));
    xhr.send();
  });
}

function exportResponse(response) {
  console.dir(response);

  var transactionData = response.set[0].data;
  console.dir(transactionData);

  function valueGetter(valueName) {
    return function (object) { return object[valueName]; };
  }
  function reduceUniques(prev, cur) {
    return (prev.indexOf(cur) < 0) ? prev.concat([cur]) : prev;
  }
  function accountFilter(accountName) {
    return function (datum) {
      return datum.account == accountName;
    };
  }
  function mapTransaction(transaction) {
    return {

    };
  }
  function mapAccount(accountName) {
    return {
      accountName: accountName,
      transactions: transactionData.filter(accountFilter(accountName)).map(mapTransaction)
    };
  }

  var accounts = transactionData.map(valueGetter('account')).reduce(reduceUniques, []);

  var groupedTransactions = accounts.map(mapAccount);
  console.dir(groupedTransactions);
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.doExport) {
    console.log('User requested export');
    resendLastRequest().then(response => {
      exportResponse(response);
    })
    return;
  }
  lastJsonDataRequest = message.getJsonDataRequest ? message.getJsonDataRequest : lastJsonDataRequest;
});
