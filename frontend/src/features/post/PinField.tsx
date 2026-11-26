import { FormField } from "../../shared";

type Props = {
  label: string;
  defaultChecked?: boolean;
};

export function PinField({ label, defaultChecked = false }: Props) {
  return (
    <FormField label="Pinned:">
      <span className="field-checkbox-label inline-flex items-center gap-2">
        <input
          type="checkbox"
          name="pinned"
          defaultChecked={defaultChecked}
          className="field-checkbox"
        />
        {label}
      </span>
    </FormField>
  );
}
