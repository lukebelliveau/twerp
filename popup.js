let apiKey = "";
let filterPrompt = "";
let filterEnabled = true;

// Load settings when popup opens
chrome.storage.sync.get(
  ["apiKey", "filterPrompt", "filterEnabled"],
  (result) => {
    apiKey = result.apiKey || "";
    filterPrompt =
      result.filterPrompt || "Determine if this tweet should be hidden...";
    filterEnabled = result.filterEnabled ?? true;

    document.getElementById("api-key").value = apiKey;
    document.getElementById("filter-prompt").value = filterPrompt;
    document.getElementById("filter-enabled").checked = filterEnabled;
  }
);

// Handle enable/disable toggle immediately
document.getElementById("filter-enabled").addEventListener("change", (e) => {
  filterEnabled = e.target.checked;
  chrome.storage.sync.set({ filterEnabled });
});

// Save other settings
document.getElementById("save-settings").addEventListener("click", () => {
  apiKey = document.getElementById("api-key").value.trim();
  filterPrompt = document.getElementById("filter-prompt").value.trim();
  chrome.storage.sync.set({ apiKey, filterPrompt });
});

document.querySelector(".panel-header").addEventListener("click", () => {
  const content = document.querySelector(".panel-content");
  content.classList.toggle("show");
  const icon = document.querySelector(".toggle-icon");
  icon.textContent = content.classList.contains("show") ? "▼" : "▶";
});

// Update filtered tweets list
async function updateFilteredTweets() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "getFilteredTweets" },
      (response) => {
        if (response && response.tweets) {
          const container = document.getElementById("filtered-tweets-content");
          container.innerHTML = response.tweets.length
            ? response.tweets
                .map(
                  (tweet) => `
            <div class="filtered-tweet">
              <div class="tweet-user">${tweet.user}</div>
              <div class="tweet-text">${tweet.text}</div>
              <div class="tweet-time">${new Date(
                tweet.timestamp
              ).toLocaleString()}</div>
            </div>
          `
                )
                .join("")
            : "<p>No tweets have been filtered yet.</p>";
        }
      }
    );
  }
}

// Update filtered tweets when popup opens
document.addEventListener("DOMContentLoaded", updateFilteredTweets);

// Update filtered tweets periodically
setInterval(updateFilteredTweets, 2000);
