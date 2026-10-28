const jsonResult = (value: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
});

const errorResult = (error: unknown) => ({
  isError: true,
  content: [{ type: 'text' as const, text: error instanceof Error ? error.message : String(error) }],
});

/**
 * Wraps a tool: what it returns becomes the JSON result and what it throws becomes an error result the assistant can read.
 * @param run - The tool's work.
 * @returns The handler to register.
 */
export function handle<Args extends unknown[]>(run: (...args: Args) => Promise<unknown>) {
  return async (...args: Args) => {
    try {
      return jsonResult(await run(...args));
    } catch (error) {
      return errorResult(error);
    }
  };
}
