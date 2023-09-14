(function () {
  const ipAddressApiUrl =
    "https://api.ip2loc.com/7W6JIBmHQk7iTbagz6iTT3TN2pVYUibT/detect";

  const copyButtonRevealDelay = 0;

  const flashDuration = 500;

  let refreshCopyButtonTimeout = null;

  function eleID(id) {
    return document.getElementById(id);
  }

  const httpGetAsync = (apiURL, callback) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        if (xmlHttp.response)
          callback({
            response: JSON.parse(xmlHttp.responseText),
            status: "success",
          });
        else callback({ status: "error" });
      } else if (
        xmlHttp.readyState === 4 &&
        (xmlHttp.status === 0 || xmlHttp.status === 404)
      ) {
        callback({ status: "error" });
      }
    };
    xmlHttp.open("GET", apiURL, true);
    xmlHttp.send(null);
  };

  // Flicker Animation
  const flicker = (domElement, duration, delay) => {
    duration = duration ? duration : 250;
    delay = delay ? delay : 0;
    domElement.style.animation = "flicker";
    domElement.style.animationDuration = duration + "ms";
    domElement.style.animationDelay = delay + "ms";
    domElement.style.animationIterationCount = "1";
    domElement.style.animationFillMode = "forwards";
  };

  const setFullScreenHeight = () => {
    const { clientHeight } = window.document.documentElement;
    eleID("fullScreenContainer").style.height = `${clientHeight}px`;
  };

  const displayIP = (ipAddress) => {
    eleID("ipAddressContainer").style.animationIterationCount = "1";
    eleID("ipAddressContainer").style.animationName = "none";
    eleID("caption").innerHTML = "YOUR IP ADDRESS";
    eleID("ipAddress").innerHTML = ipAddress;

    flicker(eleID("caption"), 350, 0);
    flicker(eleID("ipAddress"), 350, 0);
    setTimeout(() => {
      flicker(eleID("copyButton", 350, 0));
    }, copyButtonRevealDelay);
  };

  const renderAPIresult = (ApiResponse) => {
    if (ApiResponse.response && ApiResponse.status === "success") {
      const response = ApiResponse.response;

      // IP
      displayIP(response.connection.ip);
    } else {
      displayPlusymbols();
      eleID("caption").className = "captionError";
      eleID("caption").innerHTML = "ERROR";
      eleID("ipAddressContainer").style.animationDuration = "50ms";
    }
  };

  const flashIpAddress = () => {
    if (refreshCopyButtonTimeout) {
      clearTimeout(refreshCopyButtonTimeout);
    }
    eleID("ipAddress").style.animation = "flash";
    eleID("ipAddress").style.animationDuration = flashDuration + "ms";
    eleID("ipAddress").style.animationFillMode = "forwards";
    setTimeout(() => {
      eleID("ipAddress").style.animation = "none";
    }, 450);
    refreshCopyButtonTimeout = setTimeout(refreshCopyButton, 6000);
  };

  const refreshCopyButton = () => {
    eleID("copyButton").innerHTML = "COPY";
    eleID("copyButton").style.backgroundColor = "transparent";
    eleID("copyButton").style.color = "#FFF";
  };

  const triggerOnLoad = () => {
    // 1. Set Full screen
    setFullScreenHeight();
    // 2. GET IP
    httpGetAsync(ipAddressApiUrl, renderAPIresult);
  };

  window.onload = triggerOnLoad;
  window.onresize = function () {
    location.reload();
  };

  eleID("copyButton").onclick = flashIpAddress;

  const clipboard = new ClipboardJS("#copyButton");
  clipboard.on("success", function (e) {
    eleID("copyButton").innerHTML = "COPIED";
    eleID("copyButton").style.backgroundColor = "white";
    eleID("copyButton").style.color = "#333333";
    e.clearSelection();
  });

  clipboard.on("error", function (e) {});
})();
