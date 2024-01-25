import ReactSelect, { Props } from "react-select";

export interface SelectOption {
  value: string;
  label: string;
}

const Select = (props: Props) => {
  return (
    <ReactSelect
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: "#86C232",
          primary50: "#868686",
          primary75: "#868686",
          primary: "#151515",
        },
      })}
      {...props}
    />
  );
};

export default Select;
