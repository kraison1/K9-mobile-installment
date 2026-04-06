const UnauthLayout = ({ children }) => {
  return (
    <div className="mx-auto min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body bg-gradient-to-r from-gray-100 to-gray-200">
      {children}
    </div>
  );
};

export default UnauthLayout;
