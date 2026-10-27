/**
 * The error under a field. It renders nothing when the field is fine.
 * @param props - The message props.
 * @param props.show - Whether the field has an error.
 * @param props.children - The message.
 * @returns The message, or nothing.
 */
export function FieldMessage(props: { show: boolean; children: React.ReactNode }) {
  return props.show ? (
    <p role="alert" className="text-sm text-seal">
      {props.children}
    </p>
  ) : null;
}
