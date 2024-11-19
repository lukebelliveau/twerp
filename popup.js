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
