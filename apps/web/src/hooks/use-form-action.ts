import * as React from 'react';

/** What a server action reports back to its form: the fields that failed, and whether it succeeded without leaving the page. */
export type FormState = {
  errors: string[];
  done?: boolean;
};

/**
 * Sends a form to a server action from the submit handler instead of as a form action. React clears every field of a form
 * action when it finishes, which would wipe what the person typed after a failed check.
 * @param action - The server action.
 * @param initial - The state before anything is sent.
 * @returns The latest state, the submit handler for the form, a way to send data without a form, and whether a send is in progress.
 */
export function useFormAction(
  action: (state: FormState, formData: FormData) => Promise<FormState>,
  initial: FormState,
) {
  const [state, run, pending] = React.useActionState(action, initial);
  const [, startTransition] = React.useTransition();

  const submit = (data: FormData) => {
    startTransition(() => {
      run(data);
    });
  };

  const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(new FormData(event.currentTarget));
  };

  return { state, onSubmit, submit, pending };
}
