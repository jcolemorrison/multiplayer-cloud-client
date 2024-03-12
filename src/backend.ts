export const SERVER_PORT = process.env.SERVER_PORT || 2567;

export const BACKEND_URL = (window.location.href.indexOf("localhost") === -1)
    ? `${window.location.protocol.replace("http", "ws")}//${process.env.SERVER_HOST || window.location.hostname}:${SERVER_PORT}`
    : `ws://localhost:${SERVER_PORT}`;

export const BACKEND_HTTP_URL = BACKEND_URL.replace("ws", "http");