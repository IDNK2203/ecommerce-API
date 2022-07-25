import axios from "axios";
import { useEffect, useState } from "react";

function useFetch(url) {
  const [data, setdata] = useState([]);
  const [status, setstatus] = useState("pending");
  const [errMsg, seterrMsg] = useState("");

  useEffect(() => {
    const Alldata = async () => {
      try {
        const response = await axios.get(url);
        setstatus("success");
        setdata(response.data);
        seterrMsg("");
      } catch (error) {
        setstatus("error");
        const message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        seterrMsg(message);
      }
    };
    Alldata();
  }, [url]);

  return { data, status, errMsg };
}

export default useFetch;
