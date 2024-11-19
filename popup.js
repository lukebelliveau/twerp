let apiKey = "";
let filterPrompt = "";

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

// Save settings
document.getElementById("save-settings").addEventListener("click", () => {
  apiKey = document.getElementById("api-key").value.trim();
  filterPrompt = document.getElementById("filter-prompt").value.trim();
  filterEnabled = document.getElementById("filter-enabled").checked;
  chrome.storage.sync.set({ apiKey, filterPrompt, filterEnabled });
});
