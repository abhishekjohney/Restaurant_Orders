export const usePreviousRoute = () => {
  const getPreviousPathname = () => {
    return localStorage.getItem("previousPathname");
  };

  return { getPreviousPathname };
};
