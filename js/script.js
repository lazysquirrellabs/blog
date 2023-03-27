const logVisit = async () => {
  var data = {};
  data.url = window.location.href;
  data.referrer = window.document.referrer;
  const response = await fetch('https://octeto5amgynjh6zftdxw7322i0pkobn.lambda-url.eu-west-3.on.aws/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  await response.json();
}

logVisit();