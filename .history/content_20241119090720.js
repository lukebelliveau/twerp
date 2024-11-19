const FILTER_RULES = {
  keywords: ["word1", "word2"], // Add your keywords to filter
  users: ["user1", "user2"], // Add usernames to filter
};

function shouldFilterTweet(tweetElement) {
  const tweetText = tweetElement.textContent.toLowerCase();
  const userHandle = tweetElement
    .querySelector('[data-testid="User-Name"]')
    ?.textContent.toLowerCase();

  if (
    FILTER_RULES.keywords.some((keyword) =>
      tweetText.includes(keyword.toLowerCase())
    )
  ) {
    return true;
  }

  // Check users
  if (
    userHandle &&
    FILTER_RULES.users.some((user) => userHandle.includes(user.toLowerCase()))
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

// Create a MutationObserver to handle dynamically loaded tweets
const observer = new MutationObserver((mutations) => {
  filterTweets();
});

// Start observing the timeline for changes
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
