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
    <fieldset className="m-0 flex flex-col gap-2 border-none p-0 [&_legend]:mb-2 [&_legend]:p-0">
      <legend className="font-mono text-sm leading-[1.2] text-text-dark">
        {legend}
      </legend>
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-start gap-2.5 font-sans text-[15px] leading-[1.4] text-text-dark [&_input]:mt-[3px] [&_input]:shrink-0 [&_input]:accent-text-dark"
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
