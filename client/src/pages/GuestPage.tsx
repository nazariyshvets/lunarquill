import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { capitalize } from "lodash";

import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";

interface GuestPageProps {
  title: string;
}

const GuestPage = ({ title, children }: PropsWithChildren<GuestPageProps>) => {
  const { userToken } = useAuth();

  useDocumentTitle(capitalize(title));

  return (
    <>
      {userToken && <Navigate to="/profile" replace />}

      <div className="flex min-h-screen items-center justify-center bg-deep-black text-center">
        <div className="relative h-auto w-72 rounded bg-black px-4 py-10 shadow-lg shadow-primary-600 sm:w-96 sm:p-10">
          <div className="text-3xl font-bold uppercase tracking-[2px] text-lightgrey">
            {title}
          </div>
          {children}
        </div>
      </div>
    </>
  );
};

export default GuestPage;
