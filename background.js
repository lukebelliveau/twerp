chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "filterTweet") {
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": request.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `${request.prompt}\n\nTweet: "${request.tweetText}"\nUser: ${request.userHandle}\n\nShould this tweet be filtered? Reply with only "yes" or "no".`,
          },
        ],
        model: "claude-3-sonnet-20240229",
        max_tokens: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data :>> ", data);
        const filtered = data.content[0].text.toLowerCase().includes("yes");

        // Broadcast the filter decision to all listeners
        if (filtered) {
          chrome.runtime.sendMessage({
            type: "filterUpdate",
            tweet: request.tweetText,
            user: request.userHandle,
            filtered: true,
          });
        }

        sendResponse({ filtered });
      })
      .catch((error) => {
        console.error("API error:", error);
        sendResponse({ filtered: false });
      });

    return true; // Required for async response
  }
});
