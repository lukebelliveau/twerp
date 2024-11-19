let keywords = [];

// Load keywords when popup opens
chrome.storage.sync.get(["keywords"], (result) => {
  keywords = result.keywords || [];
  renderKeywords();
});

// Add keyword
document.getElementById("add-keyword").addEventListener("click", addKeyword);
// Also add enter key support
document.getElementById("new-keyword").addEventListener("keypress", (e) => {
  if (e.key === "Enter") addKeyword();
});

function addKeyword() {
  const input = document.getElementById("new-keyword");
  const keyword = input.value.trim();

  if (keyword && !keywords.includes(keyword)) {
    keywords.push(keyword);
    chrome.storage.sync.set({ keywords });
    input.value = "";
    renderKeywords();
  }
}

function renderKeywords() {
  const list = document.getElementById("keyword-list");
  list.innerHTML = "";

  keywords.forEach((keyword) => {
    const div = document.createElement("div");
    div.className = "keyword-item";

    const span = document.createElement("span");
    span.textContent = keyword;

    const button = document.createElement("button");
    button.textContent = "Remove";
    button.addEventListener("click", () => removeKeyword(keyword));

    div.appendChild(span);
    div.appendChild(button);
    list.appendChild(div);
  });
}

function removeKeyword(keyword) {
  keywords = keywords.filter((k) => k !== keyword);
  chrome.storage.sync.set({ keywords });
  renderKeywords();
}
