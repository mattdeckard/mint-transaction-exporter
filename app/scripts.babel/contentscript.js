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
  var transactionData = response.set[0].data;

  var mapTransaction = ((transaction) => ({
    date: transaction.date,
    amount: parseFloat(transaction.amount.replace(/[$,]/g, '')) * (transaction.isDebit ? -1 : 1),
    payee: transaction.merchant,
    memo: transaction.omerchant,
    category: transaction.category,
    fullTransaction: transaction
  }));

  var mapAccount = ((accountName) => ({
    accountName: accountName,
    transactions: transactionData.filter((datum) => datum.account === accountName).map(mapTransaction)
  }));

  var reduceUniques = ((prev, cur) =>
    (prev.indexOf(cur) < 0) ? prev.concat([cur]) : prev
  );

  var accounts = transactionData.map((transaction) => transaction.account).reduce(reduceUniques, []);
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
  if (message.getJsonDataRequest) {
    lastJsonDataRequest = message.getJsonDataRequest.url.includes('task=transaction') ?
      message.getJsonDataRequest :
      lastJsonDataRequest;
  }
});
