import ReactLoading from "react-loading";

const Loading = () => {
  return (
    <div className="flex h-screen min-h-screen items-center justify-center bg-deep-black text-white">
      <ReactLoading type="spinningBubbles" />
    </div>
  );
};

export default Loading;
