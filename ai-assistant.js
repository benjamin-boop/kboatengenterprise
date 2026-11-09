(function () {
    const responses = {
        'hello': 'Hello! How can I assist you with K.Boateng Enterprise products today?',
        'hi': 'Hi there! Welcome to K.Boateng Enterprise. What can I help you with?',
        'products': 'We offer a range of beauty products including shower gels, deodorants, and concentrates. Check out our shop page for details!',
        'contact': 'You can contact us via WhatsApp at +233538356979 or visit our contact page.',
        'shipping': 'We ship nationwide in Ghana. Orders are processed within 24 hours.',
        'default': 'I\'m here to help! Ask me about our products, orders, or anything else.'
    };

    function createAIAssistant() {
        const container = document.createElement('div');
        container.id = 'ai-assistant';
        container.innerHTML = `
      <button id="ai-toggle" aria-label="Open AI Assistant">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </button>
      <div id="ai-chat">
        <div id="ai-header">
          <span>AI Assistant</span>
          <button id="ai-close">&times;</button>
        </div>
        <div id="ai-messages"></div>
        <div id="ai-input-area">
          <input type="text" id="ai-input" placeholder="Ask me anything...">
          <button id="ai-send">Send</button>
        </div>
      </div>
    `;
        document.body.appendChild(container);
        return container;
    }

    function getResponse(message) {
        const lower = message.toLowerCase();
        for (const key in responses) {
            if (lower.includes(key)) return responses[key];
        }
        return responses.default;
    }

    function addMessage(text, isUser = false) {
        const messages = document.getElementById('ai-messages');
        const msg = document.createElement('div');
        msg.className = isUser ? 'user-message' : 'ai-message';
        msg.textContent = text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    function initAIAssistant() {
        const assistant = createAIAssistant();
        const toggle = document.getElementById('ai-toggle');
        const chat = document.getElementById('ai-chat');
        const close = document.getElementById('ai-close');
        const input = document.getElementById('ai-input');
        const send = document.getElementById('ai-send');

        toggle.addEventListener('click', () => {
            chat.classList.toggle('open');
        });

        close.addEventListener('click', () => {
            chat.classList.remove('open');
        });

        function sendMessage() {
            const text = input.value.trim();
            if (!text) return;
            addMessage(text, true);
            input.value = '';
            setTimeout(() => addMessage(getResponse(text)), 500);
        }

        send.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Initial greeting
        setTimeout(() => addMessage('Hello! I\'m your AI assistant. How can I help you today?'), 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAIAssistant);
    } else {
        initAIAssistant();
    }
})();