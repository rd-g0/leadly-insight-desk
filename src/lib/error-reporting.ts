type ErrorReportOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

/**
 * Reporta erros de runtime capturados pelos error boundaries da aplicacao.
 * Mantem o log no console do navegador; troque por um servico de telemetria
 * (Sentry, Logtail, etc.) caso queira enviar os eventos para fora.
 */
export function reportRuntimeError(
  error: unknown,
  context: Record<string, unknown> = {},
  options: ErrorReportOptions = {},
) {
  if (typeof window === "undefined") return;

  // Loaders e server functions costumam lancar um Response cru; String(it)
  // devolve o opaco "[object Response]", entao extraimos status e URL.
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  console.error("[runtime-error]", message, {
    stack: error instanceof Error ? error.stack : undefined,
    route: window.location.pathname,
    mechanism: options.mechanism ?? "react_error_boundary",
    handled: options.handled ?? false,
    severity: options.severity ?? "error",
    ...context,
  });
}
