/** In-memory org chat model when MOCK_DATA=true (no Postgres). */
let mockOpenaiChatModel: string | null = null;

export function getMockOpenaiChatModel() {
  return mockOpenaiChatModel;
}

export function setMockOpenaiChatModel(value: string | null) {
  mockOpenaiChatModel = value;
}
