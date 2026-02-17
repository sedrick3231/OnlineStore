import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function ProductPageReloader() {
  const { id } = useParams();

  useEffect(() => {
    // Always reload when this route is mounted
    window.location.reload();
  }, []); // Empty dependency array - runs once on mount

  return null;
}
