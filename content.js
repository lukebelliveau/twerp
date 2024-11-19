const FILTER_RULES = {
  apiKey: "",
  filterPrompt: "",
  enabled: true,
  filteredTweets: new Map(),
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
  if (changes.filterEnabled) {
    FILTER_RULES.enabled = changes.filterEnabled.newValue;
    if (!FILTER_RULES.enabled) {
      FILTER_RULES.filteredTweets.clear(); // Clear filtered tweets when disabled
      showAllTweets();
    } else {
      filterTweets();
    }
    return;
  }

  if (FILTER_RULES.enabled) {
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

    if (response.filtered) {
      FILTER_RULES.filteredTweets.set(tweetText, {
        text: tweetText,
        user: userHandle,
        timestamp: new Date().toISOString(),
      });
    }

    return response.filtered;
  } catch (error) {
    console.error("LLM filtering error:", error);
    return false;
  }
}

function getFilteredTweets() {
  return Array.from(FILTER_RULES.filteredTweets.values());
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getFilteredTweets") {
    sendResponse({ tweets: getFilteredTweets() });
  }
  return true;
});

async function filterTweets() {
  const tweets = document.querySelectorAll('[data-testid="tweet"]');
  console.log("Found tweets:", tweets.length);

  // Create a set of currently filtered tweet texts
  const currentlyFiltered = new Set();

  for (const tweet of tweets) {
    const tweetText = tweet.textContent;
    if (await shouldFilterTweet(tweet)) {
      tweet.style.display = "none";
      currentlyFiltered.add(tweetText);
    } else {
      tweet.style.display = "";
      // Remove from filtered tweets if it was previously filtered
      if (FILTER_RULES.filteredTweets.has(tweetText)) {
        FILTER_RULES.filteredTweets.delete(tweetText);
      }
    }
  }

  // Remove tweets that are no longer on the page
  for (const [tweetText] of FILTER_RULES.filteredTweets) {
    if (!currentlyFiltered.has(tweetText)) {
      FILTER_RULES.filteredTweets.delete(tweetText);
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
