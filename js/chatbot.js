document.addEventListener('DOMContentLoaded', () => {
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');

    // WARNING: This API key is exposed to the client. For production, use a backend proxy.
    const API_KEY = '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';
    const MODEL = 'x-ai/grok-4.1-fast';
    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

    let isChatOpen = false;

    // Toggle Chat Window
    function toggleChat() {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatWindow.classList.add('open');
            chatInput.focus();
        } else {
            chatWindow.classList.remove('open');
        }
    }

    chatBubble.addEventListener('click', toggleChat);
    closeChatBtn.addEventListener('click', toggleChat);

    // Send Message
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add User Message
        addMessage(message, 'user');
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;

        // Show Typing Indicator
        showTypingIndicator();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.href, // Required by OpenRouter
                    'X-Title': 'Blocks Media Chatbot' // Optional
                },
                body: JSON.stringify({
                    model: MODEL,
                    json: true,
                    messages: [
                        {
                            role: 'system',
                            content: `You are a helpful AI assistant for Blocks Media, a creative agency specializing in NFT collections, website design, and community games. 

IMPORTANT INSTRUCTION: You must ONLY answer questions related to:
      "title": "Package Name",
      "price": "$Price",
      "features": ["Feature 1", "Feature 2"],
      "action_text": "View Details",
      "action_url": "/path/to/page"
    }
  ]
}
\`\`\`

If the response is a simple conversation or greeting and does NOT involve listing specific services/packages, just return plain text.

Use the following detailed context to answer user questions accurately:

--- NFT PACKAGES ---
1. Starter Pack ($50)
   - 1 Base Image, 10 Unique Traits
   - 2 Days Delivery (Rush: 1 Day for +$10)
   - Unlimited Revisions, Commercial Rights
   - Additional Traits: $10/each
   - URL: package/nftpackage/index.html

2. Pro Collection ($125)
   - 1 Base Image, 40 Unique Traits
   - 3-4 Days Delivery (Rush: 2 Days for +$20)
   - Unlimited Revisions, Commercial Rights, Metadata Generation
   - Additional Traits: $10/each
   - URL: package/nftpackage/index.html

3. Ultimate Launch ($300)
   - 1 Base Image, 80 Unique Traits
   - 7 Days Delivery (Rush: 4 Days for +$50)
   - Unlimited Revisions, Commercial Rights, Metadata Generation, Priority Support
   - Additional Traits: $10/each
   - URL: package/nftpackage/index.html

*NFT Technical Details*:
- Generation works by stacking transparent PNG layers.
- Layer Order (Top to Bottom): Headwear(6), Eyes(5), Beak(4), Outfit(3), Body(2), Background(1).
- Rarity = Cartesian product of all layer options.

--- WEBSITE PACKAGES ---
- Starter Website (Contact for Quote)
- Includes: Custom One-Page Design, Mobile Responsive, SEO Optimization, Socials Integration, Hosting Setup.
- Fast 3-Day Turnaround.
- URL: package/websitepackage/index.html

--- MEMECOIN PACKAGE ---
- "The Viral Starter" Information
- Includes: Memecoin Character Unique Design, Brand Identity Visuals, 10x High Quality Meme Posters, 10x Meme High Quality Stickers, Memecoin Website Landing Page.
- Full Commercial Rights.
- Add-ons: NFT Collection (Launch a companion set), Game Development (Wallet-integrated mini-games).
- URL: package/memepackage/index.html

Be concise, professional, and friendly. Do not hallucinate prices or services not listed here.
ALWAYS use the JSON format with specific 'cards' for services/packages/links if possible.
IMPORTANT: In the 'features' array, provide ONLY the text content. DO NOT include bullet points, dashes, emojis, or any special characters. Write in plain text.
If you must provide a textual link in the 'full_response' or plain text, use Markdown format: [Link Title](URL).
Avoid mentioning "index.html" in the visible text. Example: Say "View Meme Package" instead of "View package/memepackage/index.html".

--- PURCHASE / ORDER INSTRUCTIONS ---
If the user asks "how to avail", "how to purchase", "how to order", or similar:
You MUST return a JSON response with:
1. A polite message directing them to our Socials or to send an email via the Contact Us page to place an order.
2. A card for "Connect on Socials" linking to "socials/index.html".
3. A card for "Contact Us" linking to "index.html#contact" (or just "#contact" if on home). Use "index.html#contact" to be safe.
Example JSON structure for this case:
\`\`\`json
{
  "full_response": "To avail our services or place an order, please reach out to us on our official social media channels or send us a message directly through our contact form. We are ready to assist you!",
  "cards": [
    {
      "title": "Connect on Socials",
      "features": ["Discord", "X (Twitter)", "Facebook"],
      "action_text": "Go to Socials",
      "action_url": "socials/index.html"
    },
    {
      "title": "Contact Us",
      "features": ["Send us an email", "Inquiries"],
      "action_text": "Go to Contact Page",
      "action_url": "index.html#contact"
    }
  ]
}
\`\`\`


--- NFT SAMPLES / PRE-MADE DESIGNS ---
If the user asks for "sample of the NFT", "samples", "pre-made designs", or similar:
You MUST return a JSON response with:
1. The message: "We are also selling pre-made designs. This will lessen the deliver time."
2. A card linking to the marketplace "https://blockscom.xyz/nftmarketplace/".
Example JSON structure:
\`\`\`json
{
    "full_response": "We are also selling pre-made designs. This will lessen the deliver time.",
    "cards": [
        {
            "title": "NFT Marketplace",
            "features": ["Pre-made Designs", "Instant Delivery"],
            "action_text": "View Marketplace",
            "action_url": "https://blockscom.xyz/nftmarketplace/"
        }
    ]
}
\`\`\`

--- NFT INFO INSTRUCTIONS ---
If the user asks about "NFT info", "how it works", "documentation", or general NFT questions:
Return a JSON response with a card linking to the NFT Docs.
Example:
\`\`\`json
{
  "full_response": "You can find comprehensive information about our NFT services, technical details, and how it works in our documentation.",
  "cards": [
    {
      "title": "NFT Documentation",
      "features": ["Technical Details", "Layers & Rarity", "How it Works"],
      "action_text": "Read the Docs",
      "action_url": "nftdocs/index.html"
    }
  ]
}
\`\`\``
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            // Remove Typing Indicator
            hideTypingIndicator();

            // Handle Response (Check for JSON)
            try {
                // Look for JSON block
                const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/```\n([\s\S]*?)\n```/);

                if (jsonMatch && jsonMatch[1]) {
                    const parsedData = JSON.parse(jsonMatch[1]);
                    addRichMessage(parsedData, 'ai');
                } else {
                    // Try parsing as raw JSON if no code blocks, sometimes LLMs forget the blocks
                    try {
                        const parsedData = JSON.parse(aiResponse);
                        addRichMessage(parsedData, 'ai');
                    } catch (e) {
                        // Regular text response
                        addMessage(aiResponse, 'ai');
                    }
                }
            } catch (e) {
                console.error("Error parsing AI response:", e);
                // Fallback to text
                addMessage(aiResponse, 'ai');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            hideTypingIndicator();
            addMessage('Sorry, I encountered an error. Please try again later.', 'system');
        } finally {
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    // Event Listeners for Sending
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Helper Functions
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);

        // Handle line breaks in text
        if (type === 'ai') {
            // For AI text messages, use the new container structure or just plain div if simple?
            // To match the new CSS, AI messages should be wrapped or styled.
            // CSS: .message.ai { width: 100%; ... } -> .ai-text-bubble

            const textBubble = document.createElement('div');
            textBubble.classList.add('ai-text-bubble');
            textBubble.innerHTML = formatMessage(text);
            messageDiv.appendChild(textBubble);

        } else {
            messageDiv.textContent = text;
        }

        // Insert before typing indicator
        chatMessages.insertBefore(messageDiv, typingIndicator);
        scrollToBottom();
    }

    function addRichMessage(data, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);

        // 1. Add Intro Text
        if (data.full_response || data.intro) {
            const textBubble = document.createElement('div');
            textBubble.classList.add('ai-text-bubble');
            textBubble.innerHTML = formatMessage(data.full_response || data.intro);
            messageDiv.appendChild(textBubble);
        }

        // 2. Add Cards
        if (data.cards && Array.isArray(data.cards)) {
            const cardContainer = document.createElement('div');
            cardContainer.classList.add('bot-card-container');

            data.cards.forEach(card => {
                const cardEl = document.createElement('div');
                cardEl.classList.add('bot-card');

                // Title & Price
                const titleEl = document.createElement('h4');
                titleEl.textContent = card.title;

                if (card.price) {
                    const priceSpan = document.createElement('span');
                    priceSpan.classList.add('price');
                    priceSpan.textContent = card.price;
                    titleEl.appendChild(priceSpan);
                }
                cardEl.appendChild(titleEl);

                // Features
                if (card.features && Array.isArray(card.features)) {
                    const ul = document.createElement('ul');
                    card.features.forEach(feat => {
                        const li = document.createElement('li');
                        // 1. Remove non-ASCII characters (fixes encoding artifacts like â€¢)
                        let cleanText = feat.replace(/[^\x20-\x7E]/g, '');
                        // 2. Remove any remaining leading non-alphanumeric characters (like - or *)
                        cleanText = cleanText.replace(/^[^a-zA-Z0-9$]+/, '').trim();
                        li.textContent = cleanText;
                        ul.appendChild(li);
                    });
                    cardEl.appendChild(ul);
                }

                // Action Button
                if (card.action_text && card.action_url) {
                    const btn = document.createElement('a');
                    btn.href = card.action_url;
                    btn.textContent = card.action_text;
                    btn.classList.add('bot-action-btn');
                    cardEl.appendChild(btn);
                }

                cardContainer.appendChild(cardEl);
            });

            messageDiv.appendChild(cardContainer);
        }

        chatMessages.insertBefore(messageDiv, typingIndicator);
        scrollToBottom();
    }

    function showTypingIndicator() {
        typingIndicator.style.display = 'flex';
        scrollToBottom();
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatMessage(text) {
        // 1. Handle Markdown Links [Title](URL) -> Button
        let formatted = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="bot-inline-btn">$1</a>');

        // 2. Handle raw URLs or paths that might be in the text (if enabled by previous patterns)
        // Detect "package/..." or "http..." that isn't already inside an <a> tag or markdown link
        // This is a simple heuristic; regex can be complex for all URLs.
        // We focus on known paths like package/ or nftdocs/ or http
        formatted = formatted.replace(/(?<!href=")(?<!\()(https?:\/\/[^\s]+|package\/[^\s]+|nftdocs\/[^\s]+|socials\/[^\s]+)/g, (match) => {
            // Clean up the label - remove index.html
            let label = match.split('/').pop().replace('index.html', '').replace(/-/g, ' ').trim();
            if (!label) label = "View Page";
            // Capitalize label
            label = label.charAt(0).toUpperCase() + label.slice(1);
            return `<a href="${match}" class="bot-inline-btn">${label}</a>`;
        });

        // 3. Clean up any remaining "index.html" in text if it wasn't valid link
        formatted = formatted.replace(/index\.html/g, '');

        // 4. Line breaks
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }
});
