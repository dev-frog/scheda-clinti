import * as React from "react"

// A simple toast hook for the furniture order form
export function useToast() {
  const [active, setActive] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const toast = ({ title }: { title: string }) => {
    setMessage(title);
    setActive(true);
    setTimeout(() => setActive(false), 3000);
  };

  return { toast, active, message };
}

export default useToast;
