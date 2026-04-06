import { useAuth } from "src/hooks/authContext";

const ModalLoadging = () => {
  const { isLoadingOpen } = useAuth();
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-[99] flex justify-center items-center ${
        isLoadingOpen ? "block" : "hidden"
      }`}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-gold-300">กำลังโหลด</span>
        </div>
      </div>
    </div>
  );
};

export default ModalLoadging;
