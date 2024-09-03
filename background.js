// we have set two permission tabs and storage from chrome yeh dono api hai

// using chrome tabs api add listener to it
// each tab id and khud ko dega
// background.js separate process chal raha chrome se baat kar raha
// background.js -> content.js-> html banega extension ka

//Step-1 // jaise tab update waise ek Listener add hua
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  //https://www.youtube.com/watch?v=0n809nd4Zu4
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1]; // v=0n809nd4Zu4
    const urlParameters = new URLSearchParams(queryParameters);

    // connecting with content script // chrome.tabs ek api hai uske methods hai onUpdate,sendMessage
    chrome.tabs.sendMessage(tabId, {
      type: "NEW", // type of event new tab khula hai woh event hai
      videoId: urlParameters.get("v"), // v=0n809nd4Zu4 got value of v
    });
  }
});
