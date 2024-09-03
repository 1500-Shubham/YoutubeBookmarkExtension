//Step- 12 // now for extension need to know whether opened webpage is youtube or not
//this code available on chrome extension page officially
export async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0];
}
