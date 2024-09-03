// (() => {})(); aise start hga content.script

// contentScript runs along with context of tab toh parallely chal raha
(() => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  //Step-8
  let currentVideoBookmarks = [];

  //jo chrome storage store kar rahe use access karna using currentVideo unique

  //Step-9
  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        // storing time json.stringify kar rahe the isliye is time json.parse kar rahe
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  // background.js se sendMeswsage hua toh usko listen karne ke liye yeh line
  //Step-2
  // sendMessage from background, popup //OnMessage on contentScript
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    // response se ulta bhej sakte background.js ko
    //obj jo background ne bheja waha se
    const { type, value, videoId } = obj;

    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    }
    //   STEP-20 // jasie youtubePlayer ko dom se nikala tha aur time nikala tha usme se while setting bookmarks
    // reverse hai uska STEP-6 deko
    else if (type === "PLAY") {
      youtubePlayer.currentTime = value;
    }
    // STEP--22
    else if (type === "DELETE") {
      // update the array
      currentVideoBookmarks = currentVideoBookmarks.filter(
        (b) => b.time != value
      );
      // update the storage with new arrayvalue
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(currentVideoBookmarks),
      });
      // STEP-23
      // sending response to popup.js file
      response(currentVideoBookmarks);
    }
  });

  //Step-3
  const newVideoLoaded = async () => {
    //Step4 mein jo bookmark BTN add kiye hai woh agar exist karta toh yeh chekc kar rahe
    // humne class name diya hai  bookmarkBtn.className = "ytp-button " + "bookmark-btn";
    const bookmarkBtnExists =
      document.getElementsByClassName("bookmark-btn")[0];

    //Step-10
    currentVideoBookmarks = await fetchBookmarks(); // value of stored bookmarks of current Video

    //Step-4
    if (!bookmarkBtnExists) {
      // document is the current webpage dom tree usme create karenge img
      const bookmarkBtn = document.createElement("img");
      // us img ka src batana
      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";
      //   document.getElementsByClassName("ytp-left-controls")[0]
      // jab  bhi youtube open karoge (inspect) karoge toh yeh div class bana hai with this
      //    classname direct (console jake run kar sakte)** javascript chalta hai waha
      // hum us dom tree ke div part ko pakad rahe usme child append
      youtubeLeftControls =
        document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName("video-stream")[0];
      // child append
      youtubeLeftControls.append(bookmarkBtn);
      //on this button added listener with event type click
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  //Step-6
  const addNewBookmarkEventHandler = async () => {
    // youtubePlayer =  document.getElementsByClassName("video-stream")[0]; to hwoh div pura hai iske andar
    // isme getting time ka method hai
    const currentTime = youtubePlayer.currentTime; // in seconds mil raha
    // video 1:06 dekh rahe show karega 66seconds aise hi yeh method bana hai
    const newBookmark = {
      time: currentTime,
      desc: "Bookmark at " + getTime(currentTime),
    };
    console.log(newBookmark);

    //Step-11 -> now go to utils.js and popup.js
    currentVideoBookmarks = await fetchBookmarks();
    // storing with key as videoID unique

    //Step-7
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        // currentVideo old destructure
        // a is of type newBookmark usme se a.time wala value used
        [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
      ),
    });
  };
  // if no new tab updated background.js kaam nahi kiya wahi function banayer hai onUpdated wala
  // refresh the page no new tab updated backgreound.js send message nahi kiya
  // never call newVideoLoaded toh img add nahi hua youtubeLeftControls mein
  // isliye called here

  //Step-5
  newVideoLoaded();
})();

//convert video 1:06 dekh rahe show karega 66seconds ulta to show
const getTime = (t) => {
  var date = new Date(0);
  date.setSeconds(1);

  return date.toISOString().substr(11, 0);
};
