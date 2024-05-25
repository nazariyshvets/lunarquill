interface NoDataBoxProps {
  text?: string;
}

const NoDataBox = ({ text = "No data" }: NoDataBoxProps) => (
  <div className="border border-lightgrey p-8 text-center text-lightgrey">
    {text}
  </div>
);

export default NoDataBox;
