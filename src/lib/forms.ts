export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export function fieldError(
  state: ActionState | null,
  name: string,
): string | undefined {
  return state?.fieldErrors?.[name];
}

export function errState(
  fieldErrors: Record<string, string>,
  message?: string,
): ActionState {
  return { ok: false, fieldErrors, message };
}

export function okState(message?: string): ActionState {
  return { ok: true, message };
}
