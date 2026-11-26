import type { ReactNode } from "react";

type Option = {
  value: string;
  label: ReactNode;
};

type Props = {
  legend: string;
  name: string;
  options: readonly Option[];
  defaultValue?: string;
};

export function RadioGroup({ legend, name, options, defaultValue }: Props) {
  return (
    <fieldset className="field-fieldset m-0 flex flex-col gap-2 p-0">
      <legend className="field-label mb-2 p-0">{legend}</legend>
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="field-radio-option flex items-start gap-2.5 [&_input]:shrink-0"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              defaultChecked={opt.value === defaultValue}
              required
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
