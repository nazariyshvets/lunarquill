import {
  useForm,
  SubmitHandler,
  FieldValues,
  Path,
  FieldError,
  DefaultValues,
} from "react-hook-form";
import { useAlert } from "react-alert";

import Input from "../components/Input";
import Button from "../components/Button";

interface ContactAdditionFormProps<T extends FieldValues> {
  submitBtnText: string;
  onSubmit: SubmitHandler<T>;
  inputField: { name: keyof T; placeholder: string; required: boolean };
  checkboxField?: { name: keyof T; label: string };
}

const ContactAdditionForm = <T extends FieldValues>({
  submitBtnText,
  onSubmit,
  inputField,
  checkboxField,
}: ContactAdditionFormProps<T>) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<T>({
    defaultValues: checkboxField
      ? ({ [checkboxField.name]: false } as DefaultValues<T>)
      : undefined,
  });
  const alert = useAlert();

  const handleFormSubmit = async (data: T) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      error instanceof Error
        ? alert.error(error.message)
        : typeof error === "string" && alert.error(error);
      console.error("Error submitting form:", error);
    }
  };

  return (
    <form
      method="POST"
      autoComplete="off"
      className="flex flex-col gap-4 sm:flex-row sm:items-start"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <div className="flex w-full flex-col gap-2">
        <Input<T>
          name={inputField.name as Path<T>}
          register={register}
          placeholder={inputField.placeholder}
          errors={errors[inputField.name] as unknown as FieldError}
          required={inputField.required}
        />
        {checkboxField && (
          <Input<T>
            type="checkbox"
            name={checkboxField.name as Path<T>}
            register={register}
            errors={errors[checkboxField.name] as unknown as FieldError}
            label={checkboxField.label}
          />
        )}
      </div>
      <Button className="w-min self-end sm:self-start">{submitBtnText}</Button>
    </form>
  );
};

export default ContactAdditionForm;
