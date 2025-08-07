class LogisticsDashboard {
    constructor() {
        this.voiceRecognition = null;
        this.isRecording = false;
        this.chatHistory = [];
        this.currentTheme = 'light';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.loadTheme();
        this.initializeChat();
        this.setupKeyboardShortcuts();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Fullscreen
        document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Map refresh
        document.getElementById('refresh-map')?.addEventListener('click', () => {
            this.refreshMap();
        });

        // Chat functionality
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn?.addEventListener('click', () => {
            this.sendMessage();
        });

        // Voice commands
        const voiceBtn = document.getElementById('voice-btn');
        voiceBtn?.addEventListener('click', () => {
            this.toggleVoiceRecording();
        });

        // Clear chat
        document.getElementById('clear-chat')?.addEventListener('click', () => {
            this.clearChat();
        });

        // Quick actions
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Documentation toggle
        document.getElementById('toggle-docs')?.addEventListener('click', () => {
            this.toggleDocs();
        });

        // Documentation tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'pt-BR';

            this.voiceRecognition.onstart = () => {
                this.isRecording = true;
                this.updateVoiceButton();
                this.showToast('Gravando... Fale agora!', 'info');
            };

            this.voiceRecognition.onend = () => {
                this.isRecording = false;
                this.updateVoiceButton();
            };

            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('chat-input').value = transcript;
                this.sendMessage();
            };

            this.voiceRecognition.onerror = (event) => {
                this.showToast(`Erro no reconhecimento de voz: ${event.error}`, 'error');
                this.isRecording = false;
                this.updateVoiceButton();
            };
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                document.getElementById('chat-input')?.focus();
            }
            
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refreshMap();
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        const icon = document.querySelector('#theme-toggle i');
        icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    refreshMap() {
        this.showLoading(true);
        
        // Simulate map refresh
        setTimeout(() => {
            this.showLoading(false);
            this.showToast('Mapa atualizado com sucesso!', 'success');
            
            // Trigger map update if there's a custom event
            const mapContainer = document.getElementById('logistics-map');
            if (mapContainer) {
                mapContainer.dispatchEvent(new CustomEvent('refresh'));
            }
        }, 1500);
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateAIResponse(message);
            this.addMessage(response, 'ai');
        }, 1000 + Math.random() * 2000);
    }

    addMessage(content, type) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = type === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.textContent = content;
        
        const messageTime = document.createElement('small');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store in chat history
        this.chatHistory.push({ content, type, timestamp: new Date() });
    }

    generateAIResponse(userMessage) {
        const responses = {
            'rotas': 'Analisando as rotas otimizadas... Com base nos dados atuais, identifiquei 3 rotas principais que podem ser melhoradas em 15% através da otimização de trajetos.',
            'veículos': 'Status da frota: 12 veículos ativos, 2 em manutenção. Tempo médio de entrega: 2.5 horas. Eficiência da rota: 87%.',
            'entregas': 'Otimização de entregas ativada. Reorganizando 24 entregas pendentes por proximidade geográfica. Economia estimada: 2.3 horas.',
            'alertas': 'Alertas ativos: 1 veículo com atraso (ID: 007), 1 rota com tráfego intenso (BR-101), 2 entregas prioritárias para hoje.',
            'tráfego': 'Condições de tráfego: Intenso na região central (15 min de atraso), normal nas demais áreas. Recomendo rotas alternativas.',
            'combustível': 'Consumo médio da frota: 8.5L/100km. Sugestão: otimizar rotas para economizar 12% no combustível.',
            'default': 'Entendi sua pergunta sobre logística. Como posso ajudar especificamente? Posso analisar rotas, rastrear veículos, otimizar entregas ou verificar alertas do sistema.'
        };

        const lowerMessage = userMessage.toLowerCase();
        
        for (const [key, response] of Object.entries(responses)) {
            if (key !== 'default' && lowerMessage.includes(key)) {
                return response;
            }
        }
        
        return responses.default;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = '<p>Digitando...</p>';

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(messageContent);
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    toggleVoiceRecording() {
        if (!this.voiceRecognition) {
            this.showToast('Reconhecimento de voz não suportado no seu navegador', 'error');
            return;
        }

        if (this.isRecording) {
            this.voiceRecognition.stop();
        } else {
            this.voiceRecognition.start();
        }
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) {
            if (this.isRecording) {
                voiceBtn.classList.add('recording');
                voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            } else {
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            }
        }
    }

    clearChat() {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>Chat limpo! Como posso ajudar você hoje?</p>
                    <small class="message-time">Agora</small>
                </div>
            </div>
        `;
        this.chatHistory = [];
        this.showToast('Chat limpo com sucesso!', 'success');
    }

    handleQuickAction(action) {
        const actions = {
            'analyze-routes': () => {
                this.addMessage('Analisar rotas otimizadas', 'user');
                setTimeout(() => {
                    this.addMessage('Análise concluída! Encontrei 3 oportunidades de melhoria nas rotas principais com economia de 18% no tempo de viagem.', 'ai');
                }, 1000);
            },
            'track-vehicles': () => {
                this.addMessage('Mostrar status dos veículos', 'user');
                setTimeout(() => {
                    this.addMessage('Status da frota: 15 veículos ativos, 2 em rota, 1 em manutenção preventiva. Todos os GPS funcionando normalmente.', 'ai');
                }, 1000);
            },
            'optimize-delivery': () => {
                this.addMessage('Otimizar entregas do dia', 'user');
                setTimeout(() => {
                    this.addMessage('Otimização aplicada! 28 entregas reorganizadas por proximidade. Redução estimada de 45 minutos no tempo total.', 'ai');
                }, 1000);
            },
            'view-alerts': () => {
                this.addMessage('Verificar alertas do sistema', 'user');
                setTimeout(() => {
                    this.addMessage('2 alertas ativos: Veículo VH-003 com 20min de atraso na Rota Sul, e manutenção programada para VH-007 amanhã às 14h.', 'ai');
                }, 1000);
            }
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    toggleDocs() {
        const docsContent = document.getElementById('docs-content');
        const toggleBtn = document.getElementById('toggle-docs');
        const icon = toggleBtn.querySelector('i');

        if (docsContent.classList.contains('collapsed')) {
            docsContent.classList.remove('collapsed');
            icon.className = 'fas fa-chevron-up';
        } else {
            docsContent.classList.add('collapsed');
            icon.className = 'fas fa-chevron-down';
        }
    }

    switchTab(tabId) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // Add active class to selected tab and panel
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    initializeChat() {
        // Add welcome message with more context
        setTimeout(() => {
            this.addMessage('Sistema logístico inicializado! Estou pronto para ajudar com análise de rotas, rastreamento de veículos, otimização de entregas e muito mais. Como posso ajudar?', 'ai');
        }, 500);
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Public API for external integrations
    updateMapData(data) {
        console.log('Updating map data:', data);
        // Integration point for external map updates
        const mapContainer = document.getElementById('logistics-map');
        if (mapContainer && typeof mapContainer.updateData === 'function') {
            mapContainer.updateData(data);
        }
    }

    sendAIMessage(message) {
        this.addMessage(message, 'ai');
    }

    getUserMessages() {
        return this.chatHistory.filter(msg => msg.type === 'user');
    }

    getAIMessages() {
        return this.chatHistory.filter(msg => msg.type === 'ai');
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.logisticsDashboard = new LogisticsDashboard();
    
    // Make it globally accessible for external integrations
    window.updateLogisticsMap = (data) => {
        window.logisticsDashboard.updateMapData(data);
    };
    
    window.sendAIMessage = (message) => {
        window.logisticsDashboard.sendAIMessage(message);
    };

    console.log('🚀 Logistics Dashboard initialized successfully!');
    console.log('📋 Available methods:', {
        'updateLogisticsMap(data)': 'Update map with new data',
        'sendAIMessage(message)': 'Send message from AI agent',
        'logisticsDashboard.*': 'Access all dashboard methods'
    });
});

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('🔧 Service Worker registered'))
            .catch(() => console.log('❌ Service Worker registration failed'));
    });
}