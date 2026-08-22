export interface AIProvider {
  analyze(text: string): Promise<{ summary: string }>;
}
export class DemoAIProvider implements AIProvider {
  async analyze() {
    return {
      summary:
        "Deterministic rules completed. Configure an AI provider for supplemental narrative analysis.",
    };
  }
}
export function getAIProvider(): AIProvider {
  return new DemoAIProvider();
}
