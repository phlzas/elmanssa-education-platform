import { apiRequest } from "./client";

export function getStreams() {
    return apiRequest("/streams");
}

export function createStream(data: { title?: string; description?: string }) {
    return apiRequest("/streams", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function getStream(id: number) {
    return apiRequest(`/streams/${id}`);
}

export function endStream(id: number) {
    return apiRequest(`/streams/${id}/end`, {
        method: "PATCH",
    });
}

export function getStreamChat(streamId: number) {
    return apiRequest(`/streams/${streamId}/chat`);
}

export function sendStreamChat(streamId: number, message: string) {
    return apiRequest(`/streams/${streamId}/chat`, {
        method: "POST",
        body: JSON.stringify({ message }),
    });
}
