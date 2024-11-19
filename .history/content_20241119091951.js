const FILTER_RULES = {
  keywords: [],
};

chrome.storage.sync.get(["keywords"], (result) => {
  FILTER_RULES.keywords = result.keywords || [];
});

function shouldFilterTweet(tweetElement) {
  const tweetText = tweetElement.textContent.toLowerCase();
  const userHandle = tweetElement
    .querySelector('[data-testid="User-Name"]')
    ?.textContent.toLowerCase();

  console.log("tweetText :>> ", tweetText);
  console.log("userHandle :>> ", userHandle);

  if (
    FILTER_RULES.keywords.some((keyword) =>
      tweetText.includes(keyword.toLowerCase())
    )
  ) {
    return true;
  }

  return false;
}

function filterTweets() {
  const tweets = document.querySelectorAll('[data-testid="tweet"]');

  tweets.forEach((tweet) => {
    if (shouldFilterTweet(tweet)) {
      tweet.style.display = "none";
    }
  });
}

const observer = new MutationObserver((mutations) => {
  filterTweets();
});

function observeTimeline() {
  const timeline = document.querySelector('[data-testid="primaryColumn"]');
  if (timeline) {
    observer.observe(timeline, {
      childList: true,
      subtree: true,
    });
  }
}

// Initial setup
observeTimeline();
window.addEventListener("load", observeTimeline);
