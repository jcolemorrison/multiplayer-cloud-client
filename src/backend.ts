export const SERVER_PORT = process.env.SERVER_PORT || 2567;

export const BACKEND_URL = process.env.APP_ENV === "production"
    ? `${window.location.protocol.replace("https", "wss")}//${process.env.SERVER_HOST || window.location.hostname}:${SERVER_PORT}`
    : `${window.location.protocol.replace("http", "ws")}//${process.env.SERVER_HOST || window.location.hostname}:${SERVER_PORT}`

export const BACKEND_HTTP_URL = process.env.APP_ENV === "production"
    ? BACKEND_URL.replace("wss", "https")
    : BACKEND_URL.replace("ws", "http")