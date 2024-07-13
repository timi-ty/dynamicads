import { useEffect } from "react";

function useNoDocumentScroll() {
  useEffect(() => {
    window.document.body.style.overflow = "hidden";
    return () => {
      window.document.body.style.overflow = "auto";
    };
  }, []);
}

export default useNoDocumentScroll;
