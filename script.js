(function () {

    const ipAddressApiUrl = 'https://api.ip2loc.com/7W6JIBmHQk7iTbagz6iTT3TN2pVYUibT/detect';
    
    const initialMapRevealDelay = 2000;
    const gridDominoesAnimDelay = 0.075;
    const domionesFallRate = 100;
    const dominoAnimationRandomness = 100;
    
    const plusAnimationRandomness = 500;
    const plusFlickerAnimationDuration = 400;
    const initialPlusRevealDelay = 1000;
    
    const mapRevealAnimationDelay = 3500;
    const copyButtonRevealDelay = 0;
  
    const flashDuration = 500;
    
    const gridCellCount = 200;
    const gridCells = [];
    const plusSymbolsInGrid = [];
    let refreshCopyButtonTimeout = null;
    
    const random = (min,max) => Math.floor(Math.random() * (max - min) + min);
    
    function eleID (id) { return document.getElementById(id) }
    
    const httpGetAsync = (apiURL, callback) => {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
          if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            if(xmlHttp.response)
              callback({response: JSON.parse(xmlHttp.responseText), status: 'success'});
            else
              callback({status: 'error'});
          }
        else if(xmlHttp.readyState === 4 && (xmlHttp.status === 0 || xmlHttp.status === 404)){
           callback({status: 'error'});
        }
              
      }
      xmlHttp.open("GET", apiURL, true);
      xmlHttp.send(null);
    }
  
    // Flicker Animation
    const flicker = (domElement, duration, delay) => {
      duration = duration ? duration: 250;
      delay = delay ? delay: 0;
      domElement.style.animation = "flicker";
      domElement.style.animationDuration = duration+"ms";
      domElement.style.animationDelay = delay+"ms";
      domElement.style.animationIterationCount = "1";
      domElement.style.animationFillMode = "forwards";
    }
  
    const setFullScreenHeight = () => {
        const { clientHeight } = window.document.documentElement;
        eleID("fullScreenContainer").style.height = `${clientHeight}px`;
    }
    
    const initializeMap = (mapDomElementID, Latitude, Longitude, city, country) => {
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
      const defaultZoomLevel = 14, indiaMapZoomLevel = 12;
      const mapOptions = {
        zoom: country === "India" ? indiaMapZoomLevel : defaultZoomLevel,
        center: new google.maps.LatLng(Latitude, Longitude),
        styles: snazzyMapStyle,
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        draggable: false,
        draggableCursor: false,
        draggingCursor: false,
        clickableIcons: false,
      };
      const map = new google.maps.Map(eleID(mapDomElementID), mapOptions);
      eleID(mapDomElementID).removeAttribute('tabindex');
      google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
        revealMap(city, country);
      });
    }
    
    const displayPlusymbols = () => {
      for(let i=0;i<gridCellCount;i++)
      {
        plusSymbolsInGrid[i].style.animation = "flicker";
        plusSymbolsInGrid[i].style.animationDuration = plusFlickerAnimationDuration+"ms";
        plusSymbolsInGrid[i].style.animationDelay = initialPlusRevealDelay + random(0,plusAnimationRandomness)+"ms";
        plusSymbolsInGrid[i].style.animationFillMode = "forwards";
      }
    }
    
    const displayIP = (ipAddress) => {
      eleID("ipAddressContainer").style.animationIterationCount = "1";
      eleID("ipAddressContainer").style.animationName = "none"; // Huh iOS
      eleID("caption").innerHTML = "TVOJE IP ADRESA";
      eleID("ipAddress").innerHTML = ipAddress;
      
      flicker(eleID("caption"), 350, 0);
      flicker(eleID("ipAddress"),350, 0);
      setTimeout(()=>{flicker(eleID("copyButton", 350, 0))}, copyButtonRevealDelay);
    }
    
    // Lokace za mapou
    const displayLocation = (city, country) => {
      if(city && country && country === city && country.length <40)
      {
        eleID("locationContainer").innerHTML = country;
        flicker(eleID("locationContainer"),350, mapRevealAnimationDelay);
      }
      else if(city && country && city.length + country.length <40)
      {
        eleID("locationContainer").innerHTML = city+ " // "+ country;
        flicker(eleID("locationContainer"),350, mapRevealAnimationDelay);
      }
      else if(!city && country && country.length <40)
      {
        eleID("locationContainer").innerHTML = country;
        flicker(eleID("locationContainer"),350, mapRevealAnimationDelay);
      }
      else if(city && !country && city.length <40)
      {
        eleID("locationContainer").innerHTML = city;
        flicker(eleID("locationContainer"),350, mapRevealAnimationDelay);
      }
    }
  
    const renderAPIresult = (ApiResponse) => {
      if(ApiResponse.response && ApiResponse.status === 'success') //&& ApiResponse.geobytesipaddress) 
      {
        const response = ApiResponse.response;
        
        // IP
        displayIP(response.connection.ip);
  
        // Zobrazení mapy
        initializeMap(
          "map",
          parseFloat(response.location.latitude),
          parseFloat(response.location.longitude),
          response.location.capital,
          response.location.country.name
        );
      }
      else{
        displayPlusymbols();
        eleID("caption").className = "captionError";
        eleID("caption").innerHTML = "ERRRRRRROR";
        eleID("ipAddressContainer").style.animationDuration = "50ms";
      }
      
    }
    
    const drawGrid = (gridContainerDomID) => {
      const container = eleID(gridContainerDomID);
      for(let i=0;i<gridCellCount;i++)
      {
        const cell = document.createElement('div');
        cell.className += "gridCell";
        const plus = document.createElement('span');
        plus.innerHTML = "+";
        plus.className = "plusSymbol";
        plusSymbolsInGrid.push(plus);
        cell.appendChild(plus);
        container.appendChild(cell);
        gridCells.push(cell);
      }
    }
    
    const revealMap = (city, country) => {
      if(country !== "South Korea") //  Jižní Korea má smůlu
      {
        displayPlusymbols();
        let delay = 0.5;
        for(let i=0;i<gridCellCount;i++)
        {
          gridCells[i].style.animation = "black2Transparent";
          gridCells[i].style.animationDuration = "100ms";
          gridCells[i].style.animationFillMode = "forwards";
          gridCells[i].style.animationDelay = (initialMapRevealDelay + random(0,dominoAnimationRandomness) + (domionesFallRate * delay)) + "ms";
          delay += gridDominoesAnimDelay;
        }
      }
      displayLocation(city, country);
    }
    
    const flashIpAddress = () => {
      if(refreshCopyButtonTimeout){
        clearTimeout(refreshCopyButtonTimeout);
      }
      eleID("ipAddress").style.animation = "flash";
      eleID("ipAddress").style.animationDuration = flashDuration+ "ms";
      eleID("ipAddress").style.animationFillMode = "forwards";
      setTimeout(() => { eleID("ipAddress").style.animation = "none"; }, 450);
      refreshCopyButtonTimeout = setTimeout(refreshCopyButton, 6000);
    }
    
    const refreshCopyButton = () => {
      eleID("copyButton").innerHTML = "OKOPÍROVAT";
      eleID("copyButton").style.backgroundColor = "transparent";
      eleID("copyButton").style.color = "#FFF";
    }
  
    const triggerOnLoad = () => {
      // 1. Set Full screen
      setFullScreenHeight();
      // 2. GET IP
      httpGetAsync(ipAddressApiUrl, renderAPIresult);
      // 3. Grid
      drawGrid("gridOverlayContainer");
    }
  
    window.onload = triggerOnLoad;
    window.onresize = function(){ location.reload(); }
    
    eleID("copyButton").onclick = flashIpAddress;
    
    const clipboard = new ClipboardJS('#copyButton');
    clipboard.on('success', function(e) {
      eleID("copyButton").innerHTML = "OKOPÍROVÁNO";
      eleID("copyButton").style.backgroundColor = "white";
      eleID("copyButton").style.color = "#333333"
      e.clearSelection();
    });
  
    clipboard.on('error', function(e) {});
  })();
  
  
  