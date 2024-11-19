let keywords = [];

// Load keywords when popup opens
chrome.storage.sync.get(["keywords"], (result) => {
  keywords = result.keywords || [];
  renderKeywords();
});

// Add keyword
document.getElementById("add-keyword").addEventListener("click", () => {
  const input = document.getElementById("new-keyword");
  const keyword = input.value.trim();

  console.log("keyword :>> ", keyword);

  if (keyword && !keywords.includes(keyword)) {
    keywords.push(keyword);
    chrome.storage.sync.set({ keywords });
    input.value = "";
    renderKeywords();
  }
});

function renderKeywords() {
  const list = document.getElementById("keyword-list");
  list.innerHTML = "";

  keywords.forEach((keyword) => {
    const div = document.createElement("div");
    div.className = "keyword-item";
    div.innerHTML = `
      <span>${keyword}</span>
      <button onclick="removeKeyword('${keyword}')">Remove</button>
    `;
    list.appendChild(div);
  });
}

function removeKeyword(keyword) {
  keywords = keywords.filter((k) => k !== keyword);
  chrome.storage.sync.set({ keywords });
  renderKeywords();
}
