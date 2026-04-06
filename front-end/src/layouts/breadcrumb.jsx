import { isEmpty } from "lodash";
import React from "react";
import { AllRouters } from "src/routers";
import { MdArrowForwardIos } from "react-icons/md";

const BreadCrumb = () => {
  const [Title, setTitle] = React.useState();
  const [SubTitle, setSubTitle] = React.useState();

  React.useEffect(() => {
    const currentRouter = AllRouters.find((router) => {
      return (
        router.path === location.pathname ||
        (router.children &&
          router?.children?.some((child) => child.path === location.pathname))
      );
    });

    if (currentRouter) {
      setTitle(currentRouter);
      document.title = `${currentRouter.label} - ${
        import.meta.env.VITE_APP_NAME
      }`;

      const currentChild = currentRouter?.children?.find(
        (child) => child.path === location.pathname
      );
      setSubTitle(currentChild ? currentChild.label : "");
    }
  }, [location.pathname]);

  return (
    <nav className="flex truncate" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 lg:space-x-2 rtl:space-x-reverse">
        <li aria-current="page">
          <div className="flex items-center text-gray-500">
            {!isEmpty(Title) && <Title.icon size={20} />}
            <span className="ms-1 text-sm font-light lg:ms-2">
              {!isEmpty(Title) && Title.label}
            </span>
          </div>
        </li>
        {!isEmpty(SubTitle) && (
          <li aria-current="page">
            <div className="flex items-center">
              <MdArrowForwardIos size={10} />
              <span className="ms-1 text-sm font-light lg:ms-2">
                {SubTitle}
              </span>
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default BreadCrumb;
