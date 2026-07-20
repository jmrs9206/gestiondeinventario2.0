package com.stockflow.inventory.mail.dto;

public class MailConnectionStatus {

    private final String protocol;
    private final boolean configured;
    private final boolean connected;
    private final String host;
    private final int port;
    private final String username;
    private final String error;

    public MailConnectionStatus(String protocol, boolean configured, boolean connected, String host, int port, String username, String error) {
        this.protocol = protocol;
        this.configured = configured;
        this.connected = connected;
        this.host = host;
        this.port = port;
        this.username = username;
        this.error = error;
    }

    public String getProtocol() {
        return protocol;
    }

    public boolean isConfigured() {
        return configured;
    }

    public boolean isConnected() {
        return connected;
    }

    public String getHost() {
        return host;
    }

    public int getPort() {
        return port;
    }

    public String getUsername() {
        return username;
    }

    public String getError() {
        return error;
    }
}
