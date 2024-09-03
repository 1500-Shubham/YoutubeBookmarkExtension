import { getActiveTabURL } from "./utils";

// adding a new bookmark row to the popup
// STEP-16
const addNewBookmark = (bookmarks, bookmark) => {
  //bookmarks is class row iske andar append karenge

  //AISA CHATE HAI
  // <div className =row bookmarks>
  //    <div newBookmarkelement>
  //        <div text= bookmark.desc> bookmarkTitleElement</div>
  //     </div>
  //   <div newBookmarkelement>
  //        <div text= bookmark.desc> bookmarkTitleElement</div>
  //     </div>
  // </div>

  const bookmarkTitleElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  //STEP-18 after setBookmark
  const controlsElement = document.createElement("div");
  controlsElement.className = "bookmark-controls"; // styling
  // add play and delete img with function defined
  //   STEP-19
  setBookmarkAttributes("play", onPlay, controlsElement);
  //   STEP-21
  setBookmarkAttributes("delete", onDelete, controlsElement);

  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title"; // for styling

  newBookmarkElement.id = "bookmark-" + bookmark.time; // unique id for deleting and playing kaam aayega
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  newBookmarkElement.appendChild(bookmarkTitleElement); // first append title
  newBookmarkElement.appendChild(controlsElement); // then append control Play and Delete buttons
  bookmarks.appendChild(newBookmarkElement); // then append newBookmark net row mein
};

const viewBookmarks = (currentBookmarks = []) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      // for each bookmark usko show karna hai bookmarksElement andar
      // STEP-15
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  return;
};

//   STEP-19
const onPlay = async (e) => {
  //   newBookmarkElement.setAttribute("timestamp", bookmark.time); yaha time set kiye hai parent ke
  // play -> controlElement -> newBookmarkElement aise parental Structure hai
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  // sending message to contentScript jo browser chala raha
  // need to send tabId as same code in background.js
  //   STEP-20 go to contentScript and make changes
  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};
//   STEP-21
const onDelete = async (e) => {
  const activeTab = await getActiveTabURL();
  // delete -> controlElement -> newBookmarkElement aise parental Structure hai
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  // yeh element banate time unique id set kiya tha timing use karke
  const bookmarkElementToDelete = document.getElementById(
    "bookmark-" + bookmarkTime
  );
  //   newBookmarkElement.id = "bookmark-" + bookmark.time;
  // now uske parent jake delete kar do child

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  // then delete this bookmark value from chrome storage
  // contentScript jake delete
  // STEP--22
  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "DELETE",
      value: bookmarkTime,
    },
    viewBookmarks
  );
};

// STEP-17 // withing each newBookmarkElement in STEP16 we need to add play and delete button with click karke actions karna
const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");
  // src can be play and delete assests mein do type buttons hai
  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  // un img buttons pe click event add kiye hai
  // <button onClick={(event)=>{}} aise hi hia on click which function to call
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

// this is the popup.html yaha se access kar sakte add delete elements
// Step-13
// addEventListener jaise click on extension button toh clickhone ka event perform hua
document.addEventListener("DOMContentLoaded", async () => {
  // same as background.js waha bhia chrome.tab api se info nikal rahe the
  const activeTab = await getActiveTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    // yeh jo humne contentScript.js banaya tha waha se code jo store kar rahe based on currentVideo
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo]
        ? JSON.parse(data[currentVideo])
        : [];

      //Step-14 now those store [] of video Bookmarks dikhayenge
      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    // popup.html ko access karke dikha rahe
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML =
      '<div class="title">This is not a youtube video page.</div>';
  }
});
