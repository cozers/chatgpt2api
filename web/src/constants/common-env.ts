const webConfig = {
    apiUrl: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : ''),
    appVersion: __APP_VERSION__ || '0.0.0',
    defaultUpdateRepo: import.meta.env.VITE_DEFAULT_UPDATE_REPO || 'ZyphrZero/chatgpt2api',
}

export default webConfig
