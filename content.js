const FILTER_RULES = {
  apiKey: "",
  filterPrompt: "",
  enabled: true,
};

// Update storage listener
chrome.storage.sync.get(
  ["apiKey", "filterPrompt", "filterEnabled"],
  (result) => {
    FILTER_RULES.apiKey = result.apiKey || "";
    FILTER_RULES.filterPrompt = result.filterPrompt || "";
    FILTER_RULES.enabled = result.filterEnabled ?? true;
  }
);

chrome.storage.onChanged.addListener((changes) => {
  if (changes.apiKey) FILTER_RULES.apiKey = changes.apiKey.newValue;
  if (changes.filterPrompt)
    FILTER_RULES.filterPrompt = changes.filterPrompt.newValue;
  if (changes.filterEnabled)
    FILTER_RULES.enabled = changes.filterEnabled.newValue;

  // Show all tweets if filtering is disabled
  if (!FILTER_RULES.enabled) {
    showAllTweets();
  } else {
    filterTweets();
  }
});

// Add this new function to show all tweets
function showAllTweets() {
  const tweets = document.querySelectorAll('[data-testid="tweet"]');
  tweets.forEach((tweet) => {
    tweet.style.display = "";
  });
}

async function shouldFilterTweet(tweetElement) {
  if (!FILTER_RULES.enabled || !FILTER_RULES.apiKey) {
    return false;
  }
  const tweetText = tweetElement.textContent;
  const userHandle = tweetElement.querySelector(
    '[data-testid="User-Name"]'
  )?.textContent;

  if (!FILTER_RULES.apiKey) {
    console.log("No API key set");
    return false;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: "filterTweet",
      apiKey: FILTER_RULES.apiKey,
      prompt: FILTER_RULES.filterPrompt,
      tweetText,
      userHandle,
    });

    return response.filtered;
  } catch (error) {
    console.error("LLM filtering error:", error);
    return false;
  }
}

async function filterTweets() {
  const tweets = document.querySelectorAll('[data-testid="tweet"]');
  console.log("Found tweets:", tweets.length);

  for (const tweet of tweets) {
    if (await shouldFilterTweet(tweet)) {
      tweet.style.display = "none";
    }
  }
}

const observer = new MutationObserver(() => {
  filterTweets().catch(console.error);
});

function observeTimeline() {
  const timeline = document.querySelector('[data-testid="primaryColumn"]');
  if (timeline) {
    observer.observe(timeline, {
      childList: true,
      subtree: true,
    });
    filterTweets().catch(console.error);
  }
}

observeTimeline();
window.addEventListener("load", observeTimeline);
