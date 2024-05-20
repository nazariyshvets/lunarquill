import { SubmitHandler } from "react-hook-form";

import ContactAdditionForm from "../components/ContactAdditionForm";
import useDocumentTitle from "../hooks/useDocumentTitle";

const ContactAdditionPage = () => {
  useDocumentTitle("Add a contact");

  const handleSubmit: SubmitHandler<{ contactId: string }> = (data) =>
    console.log("submit with data:", data);

  return (
    <div className="flex h-full w-full flex-col justify-center gap-12">
      <h1 className="text-center text-2xl font-bold text-white sm:text-3xl xl:text-4xl">
        Add a contact
      </h1>

      <ContactAdditionForm
        submitBtnText="Add"
        onSubmit={handleSubmit}
        formField={{
          name: "contactId",
          placeholder: "Enter id of the contact...",
          required: true,
        }}
      />
    </div>
  );
};

export default ContactAdditionPage;
