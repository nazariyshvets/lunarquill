import {
  useForm,
  SubmitHandler,
  FieldValues,
  Path,
  FieldError,
} from "react-hook-form";

import Input from "../components/Input";
import Button from "../components/Button";

interface ContactAdditionFormProps<T extends FieldValues> {
  submitBtnText: string;
  onSubmit: SubmitHandler<T>;
  formField: { name: keyof T; placeholder: string; required: boolean };
}

const ContactAdditionForm = <T extends FieldValues>({
  submitBtnText,
  onSubmit,
  formField,
}: ContactAdditionFormProps<T>) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<T>();

  return (
    <form
      method="POST"
      autoComplete="off"
      className="flex flex-col items-end gap-2 sm:flex-row sm:items-start"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        name={formField.name as Path<T>}
        register={register}
        placeholder={formField.placeholder}
        errors={errors[formField.name] as unknown as FieldError}
        required={formField.required}
      />
      <Button className="w-min">{submitBtnText}</Button>
    </form>
  );
};

export default ContactAdditionForm;
