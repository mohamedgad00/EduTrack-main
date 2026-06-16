import { toast } from "react-toastify";

type MessageType = string | string[] | { status?: string; errors?: string[] };

export const showToast = (type: "success" | "error" | "info", message: MessageType) => {
  let formattedMessage: string;

  if (typeof message === "string") {
    formattedMessage = message;
  } else if (Array.isArray(message)) {
    formattedMessage = message.join(", ");
  } else if (message.errors) {
    formattedMessage = message.errors.join(", ");
  } else if (message.status) {
    formattedMessage = message.status;
  } else {
    formattedMessage = "An unknown error occurred.";
  }

  if (type === "success") {
    toast.success(formattedMessage);
  } else if (type === "error") {
    toast.error(formattedMessage);
  } else if (type === "info") {
    toast.info(formattedMessage);
  }
};
